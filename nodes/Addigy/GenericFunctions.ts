import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export async function addigyApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('addigyApi');
	const apiVersion = credentials.apiVersion as string;
	const baseUrl = credentials.baseUrl as string;

	let requestOptions: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: uri || `${baseUrl}/api/${apiVersion}${resource}`,
		json: true,
	};

	if (apiVersion === 'v1') {
		// API v1 uses client_id and client_secret in query params
		requestOptions.qs = {
			...requestOptions.qs,
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
		};
	} else {
		// API v2 uses Bearer token authentication
		requestOptions.headers = {
			Authorization: `Bearer ${credentials.apiToken}`,
			'Content-Type': 'application/json',
		};
	}

	requestOptions = Object.assign({}, requestOptions, option);

	try {
		const responseData = await this.helpers.httpRequest(requestOptions);

		// Handle empty responses
		if (responseData === null || responseData === undefined) {
			return {};
		}

		return responseData;
	} catch (error: any) {
		// Enhance error message with more context
		const errorMessage = error?.response?.body?.message || error?.message || 'Unknown error occurred';
		const statusCode = error?.response?.statusCode || error?.statusCode;

		// Add helpful context to common errors
		if (statusCode === 401) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: `Authentication failed: ${errorMessage}. Please check your API credentials.`,
				description: 'Invalid or expired API token/credentials',
			});
		} else if (statusCode === 403) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: `Permission denied: ${errorMessage}. Your API token may not have the required permissions.`,
				description: 'Insufficient permissions for this operation',
			});
		} else if (statusCode === 404) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: `Resource not found: ${errorMessage}`,
				description: `The requested resource at ${resource} does not exist`,
			});
		} else if (statusCode === 429) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Rate limit exceeded. The Addigy API limits requests to 1,000 per 10 seconds.',
				description: 'Please wait before making more requests',
			});
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Addigy API Error: ${errorMessage}`,
			description: statusCode ? `HTTP ${statusCode}` : undefined,
		});
	}
}

export async function addigyApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];
	let responseData;
	let offset = 0;
	const limit = 100;
	let iterationCount = 0;
	const maxIterations = 1000; // Safety limit to prevent infinite loops

	do {
		query.limit = limit;
		query.offset = offset;

		try {
			responseData = await addigyApiRequest.call(this, method, endpoint, body, query);
		} catch (error) {
			// If we already have some data, return it; otherwise rethrow the error
			if (returnData.length > 0) {
				break;
			}
			throw error;
		}

		// Handle different response formats
		let items: any[] = [];

		if (responseData && typeof responseData === 'object') {
			// Try to extract items from the response
			if (Array.isArray(responseData[propertyName])) {
				items = responseData[propertyName];
			} else if (Array.isArray(responseData.data)) {
				// Some APIs return data in a 'data' property
				items = responseData.data;
			} else if (Array.isArray(responseData)) {
				// Response is directly an array
				items = responseData;
			}
		}

		if (items.length > 0) {
			returnData.push(...items);
		}

		// Check if there are more items to fetch
		const hasMore =
			responseData?.has_more === true ||
			responseData?.hasMore === true ||
			responseData?.pagination?.has_more === true ||
			(items.length === limit);

		if (!hasMore || items.length === 0) {
			break;
		}

		offset += limit;
		iterationCount++;

		// Safety check to prevent infinite loops
		if (iterationCount >= maxIterations) {
			console.warn(`Addigy API: Reached maximum iteration limit (${maxIterations}). Returning ${returnData.length} items.`);
			break;
		}
	} while (true);

	return returnData;
}

export function validateJSON(json: string | undefined): any {
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = undefined;
	}
	return result;
}

/**
 * Safely extracts array data from API responses
 * Handles different response formats from the Addigy API
 */
export function extractResponseData(
	responseData: any,
	propertyName: string,
): IDataObject[] {
	if (!responseData) {
		return [];
	}

	// Direct array response
	if (Array.isArray(responseData)) {
		return responseData;
	}

	// Response with specific property name
	if (Array.isArray(responseData[propertyName])) {
		return responseData[propertyName];
	}

	// Response with 'data' property
	if (Array.isArray(responseData.data)) {
		return responseData.data;
	}

	// Response with 'results' property
	if (Array.isArray(responseData.results)) {
		return responseData.results;
	}

	// Single item response - wrap in array
	if (typeof responseData === 'object' && !Array.isArray(responseData)) {
		return [responseData];
	}

	return [];
}

export async function getDevices(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const devices = await addigyApiRequestAllItems.call(
			this,
			'devices',
			'GET',
			'/devices',
		);

		if (!Array.isArray(devices) || devices.length === 0) {
			return [];
		}

		return devices
			.filter((device: IDataObject) => device.id) // Only include devices with valid IDs
			.map((device: IDataObject) => ({
				name: (device.name as string) || (device.serial_number as string) || `Device ${device.id}`,
				value: device.id as string,
			}));
	} catch (error) {
		// Return empty array instead of throwing to prevent UI errors
		console.error('Error fetching devices:', error);
		return [];
	}
}

export async function getPolicies(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const policies = await addigyApiRequestAllItems.call(
			this,
			'policies',
			'GET',
			'/policies',
		);

		if (!Array.isArray(policies) || policies.length === 0) {
			return [];
		}

		return policies
			.filter((policy: IDataObject) => policy.id) // Only include policies with valid IDs
			.map((policy: IDataObject) => ({
				name: (policy.name as string) || `Policy ${policy.id}`,
				value: policy.id as string,
			}));
	} catch (error) {
		// Return empty array instead of throwing to prevent UI errors
		console.error('Error fetching policies:', error);
		return [];
	}
}

export async function getApplications(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const applications = await addigyApiRequestAllItems.call(
			this,
			'applications',
			'GET',
			'/applications',
		);

		if (!Array.isArray(applications) || applications.length === 0) {
			return [];
		}

		return applications
			.filter((app: IDataObject) => app.id) // Only include apps with valid IDs
			.map((app: IDataObject) => ({
				name: (app.name as string) || `Application ${app.id}`,
				value: app.id as string,
			}));
	} catch (error) {
		// Return empty array instead of throwing to prevent UI errors
		console.error('Error fetching applications:', error);
		return [];
	}
}
