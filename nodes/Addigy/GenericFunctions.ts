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
		return await this.helpers.httpRequest(requestOptions);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
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

	do {
		query.limit = limit;
		query.offset = offset;

		responseData = await addigyApiRequest.call(this, method, endpoint, body, query);

		const items = responseData[propertyName];
		if (items && Array.isArray(items)) {
			returnData.push(...items);
		}

		// Check if there are more items to fetch
		const hasMore = responseData.has_more || (items && items.length === limit);
		if (!hasMore) {
			break;
		}

		offset += limit;
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

export async function getDevices(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const devices = await addigyApiRequestAllItems.call(
		this,
		'devices',
		'GET',
		'/devices',
	);

	return devices.map((device: IDataObject) => ({
		name: device.name as string || device.serial_number as string,
		value: device.id as string,
	}));
}

export async function getPolicies(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const policies = await addigyApiRequestAllItems.call(
		this,
		'policies',
		'GET',
		'/policies',
	);

	return policies.map((policy: IDataObject) => ({
		name: policy.name as string,
		value: policy.id as string,
	}));
}

export async function getApplications(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const applications = await addigyApiRequestAllItems.call(
		this,
		'applications',
		'GET',
		'/applications',
	);

	return applications.map((app: IDataObject) => ({
		name: app.name as string,
		value: app.id as string,
	}));
}
