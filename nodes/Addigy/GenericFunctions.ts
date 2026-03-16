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

export type AddigyApiResponse = IDataObject | IDataObject[];

export async function addigyApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	uri?: string,
	option: IDataObject = {},
): Promise<AddigyApiResponse> {
	const credentials = await this.getCredentials('addigyApi');
	const baseUrl = credentials.baseUrl as string;
	const apiToken = credentials.apiToken as string;

	let requestOptions: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: uri || `${baseUrl}/api/v2${resource}`,
		json: true,
	};

	requestOptions.headers = {
		'x-api-key': apiToken,
		'Content-Type': 'application/json',
	};

	requestOptions = Object.assign({}, requestOptions, option);

	try {
		const responseData = await this.helpers.httpRequest(requestOptions);

		// Handle empty responses
		if (responseData === null || responseData === undefined) {
			return {};
		}

		return responseData;
	} catch (error: unknown) {
		const errorData = (error ?? {}) as JsonObject;
		const errorObject = error as IDataObject | undefined;
		const errorResponse = errorObject?.response as IDataObject | undefined;
		const responseBody = errorResponse?.body as IDataObject | undefined;

		// Enhance error message with more context
		const errorMessage =
			(responseBody?.message as string) ||
			(errorObject?.message as string) ||
			'Unknown error occurred';
		const statusCode =
			(errorResponse?.statusCode as number | undefined) ||
			(errorObject?.statusCode as number | undefined);

		// Add helpful context to common errors
		if (statusCode === 401) {
			throw new NodeApiError(this.getNode(), errorData, {
				message: `Authentication failed: ${errorMessage}. Please check your API credentials.`,
				description: 'Invalid or expired API token',
			});
		} else if (statusCode === 403) {
			throw new NodeApiError(this.getNode(), errorData, {
				message: `Permission denied: ${errorMessage}. Your API token may not have the required permissions.`,
				description: 'Insufficient permissions for this operation',
			});
		} else if (statusCode === 404) {
			throw new NodeApiError(this.getNode(), errorData, {
				message: `Resource not found: ${errorMessage}`,
				description: `The requested resource at ${resource} does not exist`,
			});
		} else if (statusCode === 429) {
			throw new NodeApiError(this.getNode(), errorData, {
				message: 'Rate limit exceeded. The Addigy API limits requests to 1,000 per 10 seconds.',
				description: 'Please wait before making more requests',
			});
		}

		throw new NodeApiError(this.getNode(), errorData, {
			message: `Addigy API Error: ${errorMessage}`,
			description: statusCode ? `HTTP ${statusCode}` : undefined,
		});
	}
}

export function asDataObject(responseData: AddigyApiResponse): IDataObject {
	return Array.isArray(responseData) ? {} : responseData;
}

export function getResponseItems(responseData: AddigyApiResponse): IDataObject[] {
	if (Array.isArray(responseData)) {
		return responseData;
	}

	return Array.isArray(responseData.items) ? (responseData.items as IDataObject[]) : [];
}

export function getResponseMetadata(responseData: AddigyApiResponse): IDataObject {
	const responseObject = asDataObject(responseData);
	return (responseObject.metadata as IDataObject | undefined) ?? {};
}

export async function getDevices(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await this.getCredentials('addigyApi');
		const organizationId = credentials.organizationId as string;
		const devices: IDataObject[] = [];
		let page = 1;
		const perPage = 100;
		let hasMore = true;

		while (hasMore) {
			const responseData = await addigyApiRequest.call(
				this,
				'POST',
				`/o/${organizationId}/devices`,
				{
					page,
					per_page: perPage,
					sort_direction: 'asc',
					sort_field: 'serial_number',
					query: {},
				},
			);

			const items = getResponseItems(responseData);
			if (items.length > 0) {
				devices.push(...items);
			}

			const metadata = getResponseMetadata(responseData);
			const currentPage = (metadata.page as number) ?? page;
			const pageCount = (metadata.page_count as number) ?? currentPage;
			hasMore = items.length > 0 && currentPage < pageCount;
			if (hasMore) {
				page += 1;
			}
		}

		if (!Array.isArray(devices) || devices.length === 0) {
			return [];
		}

		return devices
			.filter((device: IDataObject) => device.id || device.agentid) // Only include devices with valid IDs
			.map((device: IDataObject) => {
				const id = (device.id as string) || (device.agentid as string);
				const facts = device.facts as IDataObject | undefined;
				const deviceNameFact = facts?.device_name as IDataObject | undefined;
				const serialNumberFact = facts?.serial_number as IDataObject | undefined;
				const name =
					(device.name as string) ||
					(device.serial_number as string) ||
					(deviceNameFact?.value as string) ||
					(serialNumberFact?.value as string) ||
					`Device ${id}`;

				return {
					name,
					value: id,
				};
			});
	} catch {
		// Return empty array instead of throwing to prevent UI errors
		return [];
	}
}

export async function getPolicies(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const policies = await addigyApiRequest.call(
			this,
			'POST',
			'/oa/policies/query',
			{},
		);

		if (!Array.isArray(policies) || policies.length === 0) {
			return [];
		}

		return policies
			.filter((policy: IDataObject) => policy.policyId || policy.id) // Only include policies with valid IDs
			.map((policy: IDataObject) => ({
				name: (policy.name as string) || `Policy ${(policy.policyId as string) || (policy.id as string)}`,
				value: ((policy.policyId as string) || (policy.id as string)) as string,
			}));
	} catch {
		// Return empty array instead of throwing to prevent UI errors
		return [];
	}
}

export async function getApplications(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const applications: IDataObject[] = [];
		let page = 1;
		const perPage = 100;
		let hasMore = true;

		while (hasMore) {
			const responseData = await addigyApiRequest.call(
				this,
				'POST',
				'/oa/smart-software/query',
				{
					page,
					per_page: perPage,
					sort_direction: 'asc',
					sort_field: 'name',
					query: {},
				},
			);

			const items = getResponseItems(responseData);
			if (items.length > 0) {
				applications.push(...items);
			}

			const metadata = getResponseMetadata(responseData);
			const currentPage = (metadata.page as number) ?? page;
			const pageCount = (metadata.page_count as number) ?? currentPage;
			hasMore = items.length > 0 && currentPage < pageCount;
			if (hasMore) {
				page += 1;
			}
		}

		if (!Array.isArray(applications) || applications.length === 0) {
			return [];
		}

		return applications
			.filter((app: IDataObject) => app.id || app.identifier) // Only include apps with valid IDs
			.map((app: IDataObject) => ({
				name: (app.name as string) || `Application ${(app.id as string) || (app.identifier as string)}`,
				value: ((app.id as string) || (app.identifier as string)) as string,
			}));
	} catch {
		// Return empty array instead of throwing to prevent UI errors
		return [];
	}
}

export async function getDeviceFactKeys(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await this.getCredentials('addigyApi');
		const organizationId = credentials.organizationId as string;

		const responseData = await addigyApiRequest.call(
			this,
			'POST',
			`/o/${organizationId}/devices`,
			{
				page: 1,
				per_page: 50,
				sort_direction: 'asc',
				sort_field: 'serial_number',
				query: {},
			},
		);

		const items = getResponseItems(responseData);
		const keySet = new Set<string>();

		for (const item of items) {
			const facts = (item as IDataObject).facts as IDataObject | undefined;
			if (!facts || typeof facts !== 'object') {
				continue;
			}
			for (const key of Object.keys(facts)) {
				keySet.add(key);
			}
		}

		return [...keySet]
			.sort((a, b) => a.localeCompare(b))
			.map((key) => ({
				name: key,
				value: key,
			}));
	} catch {
		return [];
	}
}
