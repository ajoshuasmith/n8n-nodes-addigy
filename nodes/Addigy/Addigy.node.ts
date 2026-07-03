import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INode,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

import {
	addigyApiRequest,
	asDataObject,
	getDevices,
	getPolicies,
	getApplications,
	getDeviceFactKeys,
	getResponseItems,
	getResponseMetadata,
} from './GenericFunctions';

import { deviceOperations, deviceFields } from './descriptions/DeviceDescription';
import { policyOperations, policyFields } from './descriptions/PolicyDescription';
import { alertOperations, alertFields } from './descriptions/AlertDescription';
import { applicationOperations, applicationFields } from './descriptions/ApplicationDescription';
import { factOperations, factFields } from './descriptions/FactDescription';
import { instructionOperations, instructionFields } from './descriptions/InstructionDescription';
import { billingOperations, billingFields } from './descriptions/BillingDescription';

function normalizeAlertStatus(status: string): string {
	const statusMap: Record<string, string> = {
		open: 'Unattended',
		unattended: 'Unattended',
		acknowledged: 'Acknowledged',
		resolved: 'Resolved',
	};

	return statusMap[status.toLowerCase()] ?? status;
}

function parseJsonObject(value: string, label: string, node: INode): IDataObject {
	const trimmed = value.trim();
	if (!trimmed) {
		return {};
	}

	try {
		const parsed = JSON.parse(trimmed) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			throw new Error(`${label} must be a JSON object`);
		}
		return parsed as IDataObject;
	} catch (error) {
		throw new NodeOperationError(node, `Invalid JSON in ${label}: ${(error as Error).message}`);
	}
}

function normalizeApiPath(path: string): string {
	if (!path.startsWith('/')) {
		throw new Error('API path must start with /. Full external URLs are not allowed.');
	}
	if (path.startsWith('//') || path.includes('://')) {
		throw new Error('API path must be relative to the Addigy API base URL.');
	}
	return path;
}

export class Addigy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Addigy',
		name: 'addigy',
		icon: 'file:addigy.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Addigy API for Apple device management',
		defaults: {
			name: 'Addigy',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'addigyApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}/api/v2',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Alert',
						value: 'alert',
					},
						{
							name: 'Application',
							value: 'application',
						},
						{
							name: 'API Request',
							value: 'apiRequest',
							description: 'Call any Addigy API v2 endpoint by path',
						},
						{
							name: 'Billing',
							value: 'billing',
					},
					{
						name: 'Device',
						value: 'device',
					},
					{
						name: 'Fact',
						value: 'fact',
					},
					{
						name: 'Instruction',
						value: 'instruction',
					},
					{
						name: 'Policy',
						value: 'policy',
					},
					],
					default: 'device',
				},
				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					noDataExpression: true,
					displayOptions: {
						show: {
							resource: ['apiRequest'],
						},
					},
					options: [
						{
							name: 'Request',
							value: 'request',
							action: 'Make an API request',
						},
					],
					default: 'request',
				},
				{
					displayName: 'Method',
					name: 'apiMethod',
					type: 'options',
					displayOptions: {
						show: {
							resource: ['apiRequest'],
							operation: ['request'],
						},
					},
					options: [
						{ name: 'DELETE', value: 'DELETE' },
						{ name: 'GET', value: 'GET' },
						{ name: 'PATCH', value: 'PATCH' },
						{ name: 'POST', value: 'POST' },
						{ name: 'PUT', value: 'PUT' },
					],
					default: 'GET',
				},
				{
					displayName: 'Path',
					name: 'apiPath',
					type: 'string',
					required: true,
					default: '/o/{organization_id}/devices',
					description: 'Path relative to the Addigy API v2 base URL. Must start with /.',
					displayOptions: {
						show: {
							resource: ['apiRequest'],
							operation: ['request'],
						},
					},
				},
				{
					displayName: 'Query Parameters JSON',
					name: 'apiQueryJson',
					type: 'json',
					default: '{}',
					description: 'JSON object sent as query parameters',
					displayOptions: {
						show: {
							resource: ['apiRequest'],
							operation: ['request'],
						},
					},
				},
				{
					displayName: 'Body JSON',
					name: 'apiBodyJson',
					type: 'json',
					default: '{}',
					description: 'JSON object sent as the request body for methods that support a body',
					displayOptions: {
						show: {
							resource: ['apiRequest'],
							operation: ['request'],
						},
					},
				},
				...deviceOperations,
			...deviceFields,
			...policyOperations,
			...policyFields,
			...alertOperations,
			...alertFields,
			...applicationOperations,
			...applicationFields,
			...factOperations,
			...factFields,
				...instructionOperations,
				...instructionFields,
				...billingOperations,
				...billingFields,
			],
		};

	methods = {
		loadOptions: {
			async getDevices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getDevices.call(this);
			},
			async getPolicies(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getPolicies.call(this);
			},
			async getApplications(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getApplications.call(this);
			},
			async getDeviceFactKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getDeviceFactKeys.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
					const credentials = await this.getCredentials('addigyApi');
					const organizationId = credentials.organizationId as string;

					if (resource === 'apiRequest') {
						const method = this.getNodeParameter('apiMethod', i) as 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
						const path = normalizeApiPath(this.getNodeParameter('apiPath', i) as string).replaceAll(
							'{organization_id}',
							organizationId,
						);
						const qs = parseJsonObject(
							this.getNodeParameter('apiQueryJson', i, '{}') as string,
							'Query Parameters JSON',
							this.getNode(),
						);
						const body = parseJsonObject(
							this.getNodeParameter('apiBodyJson', i, '{}') as string,
							'Body JSON',
							this.getNode(),
						);
						const responseData = await addigyApiRequest.call(this, method, path, body, qs);

						if (Array.isArray(responseData)) {
							responseData.forEach((item: IDataObject) => {
								returnData.push({ json: item, pairedItem: { item: i } });
							});
						} else {
							returnData.push({ json: asDataObject(responseData), pairedItem: { item: i } });
						}
					}

					if (resource === 'device') {
					const queryDevices = async (page: number, perPage: number, query: IDataObject = {}) => {
						return addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/devices`,
							{
								page,
								per_page: perPage,
								sort_direction: 'asc',
								sort_field: 'serial_number',
								query,
							},
						);
					};

					if (operation === 'get') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const responseData = await queryDevices(1, 100, { search_any: deviceId });
						const devices = getResponseItems(responseData);
						const device =
							devices.find((item: IDataObject) => item.agentid === deviceId) ||
							devices.find((item: IDataObject) => item.id === deviceId) ||
							devices[0];

						if (!device) {
							throw new Error(`Device not found: ${deviceId}`);
						}

						returnData.push({ json: device as IDataObject });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const query: IDataObject = {};
						const auditFilters: IDataObject[] = [];

						if (filters.policyId) {
							query.policy_id = filters.policyId;
						}

						const searchTerms: string[] = [];
						if (filters.serial_number) {
							searchTerms.push(filters.serial_number as string);
						}
						if (filters.status && filters.status !== 'all') {
							searchTerms.push(filters.status as string);
						}
						if (filters.device_type) {
							searchTerms.push(filters.device_type as string);
						}
						if (searchTerms.length > 0) {
							query.search_any = searchTerms.join(' ');
						}

						const factFiltersRaw = (
							(filters.factFilters as IDataObject | undefined)?.factFilter ||
							[]
						) as IDataObject[];

						for (const factFilter of factFiltersRaw) {
							if (!factFilter.factName) {
								continue;
							}

							const auditFilter: IDataObject = {
								audit_field: factFilter.factName,
								operation: (factFilter.operator as string) || 'equals',
								type: (factFilter.type as string) || 'string',
							};

							if (factFilter.value !== undefined && factFilter.value !== '') {
								const filterType = (factFilter.type as string) || 'string';
								if (filterType === 'number') {
									auditFilter.value = Number(factFilter.value);
								} else if (filterType === 'boolean') {
									auditFilter.value = String(factFilter.value).toLowerCase() === 'true';
								} else {
									auditFilter.value = factFilter.value;
								}
							}

							if (factFilter.rangeValue !== undefined && factFilter.rangeValue !== '') {
								auditFilter.range_value = factFilter.rangeValue;
							}

							auditFilters.push(auditFilter);
						}

						if (auditFilters.length > 0) {
							query.filters = auditFilters;
						}

						if (returnAll) {
							let page = 1;
							const perPage = 100;
							let hasMore = true;

							while (hasMore) {
								const responseData = await queryDevices(page, perPage, query);

								const devices = getResponseItems(responseData);
								devices.forEach((item: IDataObject) => {
									returnData.push({ json: item });
								});

								const metadata = getResponseMetadata(responseData);
								const currentPage = (metadata.page as number) ?? page;
								const pageCount = (metadata.page_count as number) ?? currentPage;
								hasMore = devices.length > 0 && currentPage < pageCount;

								if (hasMore) {
									page += 1;
								}
							}
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await queryDevices(1, limit, query);

							const devices = getResponseItems(responseData);
							devices.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'count') {
						const countFilters = this.getNodeParameter('countFilters', i) as IDataObject;
						const query: IDataObject = {};
						const auditFilters: IDataObject[] = [];

						if (countFilters.policyId) {
							query.policy_id = countFilters.policyId;
						}
						if (countFilters.searchAny) {
							query.search_any = countFilters.searchAny;
						}

						const factFiltersRaw = (
							(countFilters.factFilters as IDataObject | undefined)?.factFilter ||
							[]
						) as IDataObject[];

						for (const factFilter of factFiltersRaw) {
							if (!factFilter.factName) {
								continue;
							}

							const auditFilter: IDataObject = {
								audit_field: factFilter.factName,
								operation: (factFilter.operator as string) || 'equals',
								type: (factFilter.type as string) || 'string',
							};

							if (factFilter.value !== undefined && factFilter.value !== '') {
								const filterType = (factFilter.type as string) || 'string';
								if (filterType === 'number') {
									auditFilter.value = Number(factFilter.value);
								} else if (filterType === 'boolean') {
									auditFilter.value = String(factFilter.value).toLowerCase() === 'true';
								} else {
									auditFilter.value = factFilter.value;
								}
							}

							if (factFilter.rangeValue !== undefined && factFilter.rangeValue !== '') {
								auditFilter.range_value = factFilter.rangeValue;
							}

							auditFilters.push(auditFilter);
						}

						if (auditFilters.length > 0) {
							query.filters = auditFilters;
						}

						const responseData = await queryDevices(1, 1, query);

						const metadata = getResponseMetadata(responseData);
						returnData.push({
							json: {
								total: (metadata.total as number) ?? 0,
								metadata,
							},
						});
					}

					if (operation === 'getFacts') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const responseData = await queryDevices(1, 100, { search_any: deviceId });
						const devices = getResponseItems(responseData);
						const device =
							devices.find((item: IDataObject) => item.agentid === deviceId) ||
							devices.find((item: IDataObject) => item.id === deviceId) ||
							devices[0];

						if (!device) {
							throw new Error(`Device not found: ${deviceId}`);
						}

						returnData.push({ json: ((device as IDataObject).facts as IDataObject) || {} });
					}

					if (operation === 'update') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						if (!updateFields.policyId) {
							throw new Error('Device update in API v2 supports policy assignment only. Set Policy in Update Fields.');
						}

						await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/devices/assign`,
							{
								agent_ids: [deviceId],
								policy_ids: [updateFields.policyId as string],
							},
						);

						returnData.push({
							json: {
								success: true,
								device_id: deviceId,
								policy_id: updateFields.policyId,
							},
						});
					}

					if (operation === 'runCommand') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const command = this.getNodeParameter('command', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const commandMap: Record<string, string> = {
							restart: 'sudo shutdown -r now',
							shutdown: 'sudo shutdown -h now',
							lock: 'pmset displaysleepnow',
							clear_passcode: '',
							refresh_facts: '/Library/Addigy/go-agent audit',
						};
						const mappedCommand = commandMap[command] ?? command;

						if (!mappedCommand) {
							throw new Error(`Command "${command}" is not supported by Addigy API v2 shell command execution.`);
						}

						const body: IDataObject = {
							agent_ids: [deviceId],
							command: mappedCommand,
							background: true,
						};

						if (additionalFields.message) {
							body.command = `echo "${String(additionalFields.message).replaceAll('"', '\\"')}" && ${mappedCommand}`;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/devices/commands/run`,
							body,
						);
						returnData.push({ json: asDataObject(responseData) });
					}
				}

				if (resource === 'policy') {
					if (operation === 'get') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/oa/policies/query',
							{
								policies: [policyId],
							},
						);
						const policies = Array.isArray(responseData) ? responseData : [];
						if (policies.length === 0) {
							throw new Error(`Policy not found: ${policyId}`);
						}
						returnData.push({ json: policies[0] as IDataObject });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/oa/policies/query',
							{},
						);

						let policies = Array.isArray(responseData) ? responseData : [];
						if (filters.name) {
							const search = String(filters.name).toLowerCase();
							policies = policies.filter((item: IDataObject) =>
								String(item.name || '').toLowerCase().includes(search),
							);
						}

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							policies = policies.slice(0, limit);
						}

						policies.forEach((item: IDataObject) => {
							returnData.push({ json: item });
						});
					}

					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {
							name,
						};

						if (additionalFields.description) {
							body.description = additionalFields.description;
						}
						if (additionalFields.parent_policy_id) {
							body.parent_policy_id = additionalFields.parent_policy_id;
						}
						if (additionalFields.color) {
							body.color = additionalFields.color;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/policies`,
							body,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'update') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const body: IDataObject = {
							policy_id: policyId,
						};

						if (updateFields.name) {
							body.name = updateFields.name;
						}
						if (updateFields.description) {
							body.description = updateFields.description;
						}
						if (updateFields.color) {
							body.color = updateFields.color;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'PUT',
							`/o/${organizationId}/policies`,
							body,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'delete') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'DELETE',
							`/o/${organizationId}/policies`,
							{},
							{
								id: policyId,
							},
						);
						returnData.push({ json: { success: true, ...responseData } });
					}
				}

				if (resource === 'alert') {
					if (operation === 'get') {
						const alertId = this.getNodeParameter('alertId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/oa/monitoring/alerts/query',
							{
								page: 1,
								per_page: 50,
								sort_direction: 'desc',
								sort_field: 'name',
								query: {
									ids: [alertId],
								},
							},
						);
						const alerts = getResponseItems(responseData);
						const alert = alerts.find((item: IDataObject) => item.id === alertId) || alerts[0];
						if (!alert) {
							throw new Error(`Alert not found: ${alertId}`);
						}
						returnData.push({ json: alert as IDataObject });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const query: IDataObject = {};

						if (filters.deviceId) {
							query.agent_ids = [filters.deviceId as string];
						}
						if (filters.status && filters.status !== 'all') {
							query.statuses = [normalizeAlertStatus(filters.status as string)];
						}
						if (filters.start_date) {
							query.start_date = filters.start_date;
						}
						if (filters.end_date) {
							query.end_date = filters.end_date;
						}
						if (filters.severity) {
							query.category = filters.severity;
						}

						if (returnAll) {
							let page = 1;
							const perPage = 100;
							let hasMore = true;

							while (hasMore) {
								const responseData = await addigyApiRequest.call(
									this,
									'POST',
									'/oa/monitoring/alerts/query',
									{
										page,
										per_page: perPage,
										sort_direction: 'desc',
										sort_field: 'name',
										query,
									},
								);

								const alerts = getResponseItems(responseData);
								alerts.forEach((item: IDataObject) => {
									returnData.push({ json: item });
								});

								const metadata = getResponseMetadata(responseData);
								const currentPage = (metadata.page as number) ?? page;
								const pageCount = (metadata.page_count as number) ?? currentPage;
								hasMore = alerts.length > 0 && currentPage < pageCount;
								if (hasMore) {
									page += 1;
								}
							}
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await addigyApiRequest.call(
								this,
								'POST',
								'/oa/monitoring/alerts/query',
								{
									page: 1,
									per_page: limit,
									sort_direction: 'desc',
									sort_field: 'name',
									query,
								},
							);

							const alerts = getResponseItems(responseData);
							alerts.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'resolve') {
						const alertId = this.getNodeParameter('alertId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/monitoring/alerts/resolve`,
							{
								alert_ids: [alertId],
							},
						);
						returnData.push({ json: { success: true, response: responseData } });
					}
				}

				if (resource === 'application') {
					if (operation === 'get') {
						const applicationId = this.getNodeParameter('applicationId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/o/${organizationId}/smart-software/${applicationId}`,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const query: IDataObject = {};

						if (filters.name) {
							query.name_contains = filters.name;
						}

						if (returnAll) {
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
										query,
									},
								);

								const applications = getResponseItems(responseData);
								applications.forEach((item: IDataObject) => {
									returnData.push({ json: item });
								});

								const metadata = getResponseMetadata(responseData);
								const currentPage = (metadata.page as number) ?? page;
								const pageCount = (metadata.page_count as number) ?? currentPage;
								hasMore = applications.length > 0 && currentPage < pageCount;
								if (hasMore) {
									page += 1;
								}
							}
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await addigyApiRequest.call(
								this,
								'POST',
								'/oa/smart-software/query',
								{
									page: 1,
									per_page: limit,
									sort_direction: 'asc',
									sort_field: 'name',
									query,
								},
							);

							const applications = getResponseItems(responseData);
							applications.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'deploy') {
						const applicationId = this.getNodeParameter('applicationId', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						if (targetType !== 'policy') {
							throw new Error('Addigy API v2 supports Smart Software assignment to policy only.');
						}
						const policyId = this.getNodeParameter('policyId', i) as string;

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/policies/${policyId}/smart-software/${applicationId}`,
						);
						returnData.push({ json: { success: true, response: responseData } });
					}

					if (operation === 'remove') {
						const applicationId = this.getNodeParameter('applicationId', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						if (targetType !== 'policy') {
							throw new Error('Addigy API v2 supports Smart Software unassignment from policy only.');
						}
						const policyId = this.getNodeParameter('policyId', i) as string;

						const responseData = await addigyApiRequest.call(
							this,
							'DELETE',
							`/o/${organizationId}/policies/${policyId}/smart-software/${applicationId}`,
						);
						returnData.push({ json: { success: true, response: responseData } });
					}
				}

				if (resource === 'fact') {
					const findFactByName = async (factName: string): Promise<IDataObject | undefined> => {
						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/facts/custom/query',
							{
								page: 1,
								per_page: 100,
								sort_direction: 'asc',
								sort_field: 'name',
								query: {
									name_contains: factName,
								},
							},
						);

						const items = getResponseItems(responseData);
						const exact = items.find(
							(item: IDataObject) => String(item.name || '').toLowerCase() === factName.toLowerCase(),
						);
						return (exact || items[0]) as IDataObject | undefined;
					};

					if (operation === 'get') {
						const factName = this.getNodeParameter('factName', i) as string;
						const fact = await findFactByName(factName);
						if (!fact?.id) {
							throw new Error(`Custom fact not found: ${factName}`);
						}

						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/o/${organizationId}/facts/custom/${fact.id as string}`,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);

						if (returnAll) {
							let page = 1;
							const perPage = 100;
							let hasMore = true;

							while (hasMore) {
								const responseData = await addigyApiRequest.call(
									this,
									'POST',
									'/facts/custom/query',
									{
										page,
										per_page: perPage,
										sort_direction: 'asc',
										sort_field: 'name',
										query: {},
									},
								);

								const facts = getResponseItems(responseData);
								facts.forEach((item: IDataObject) => {
									returnData.push({ json: item });
								});

								const metadata = getResponseMetadata(responseData);
								const currentPage = (metadata.page as number) ?? page;
								const pageCount = (metadata.page_count as number) ?? currentPage;
								hasMore = facts.length > 0 && currentPage < pageCount;
								if (hasMore) {
									page += 1;
								}
							}
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await addigyApiRequest.call(
								this,
								'POST',
								'/facts/custom/query',
								{
									page: 1,
									per_page: limit,
									sort_direction: 'asc',
									sort_field: 'name',
									query: {},
								},
							);

							const facts = getResponseItems(responseData);
							facts.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const type = this.getNodeParameter('type', i) as string;
						const script = this.getNodeParameter('script', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {
							name,
							return_type: type,
						};

						if (additionalFields.description) {
							body.notes = additionalFields.description;
						}
						if (script) {
							body.notes = body.notes
								? `${String(body.notes)}\n\nScript:\n${script}`
								: `Script:\n${script}`;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/facts/custom`,
							body,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'update') {
						const factName = this.getNodeParameter('factName', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const existingFact = await findFactByName(factName);
						if (!existingFact?.id) {
							throw new Error(`Custom fact not found: ${factName}`);
						}

						const body: IDataObject = {
							id: existingFact.id as string,
						};

						if (updateFields.description) {
							body.notes = updateFields.description;
						}
						if (updateFields.script) {
							body.notes = body.notes
								? `${String(body.notes)}\n\nScript:\n${String(updateFields.script)}`
								: `Script:\n${String(updateFields.script)}`;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'PUT',
							`/o/${organizationId}/facts/custom`,
							body,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'delete') {
						const factName = this.getNodeParameter('factName', i) as string;
						const existingFact = await findFactByName(factName);
						if (!existingFact?.id) {
							throw new Error(`Custom fact not found: ${factName}`);
						}

						const responseData = await addigyApiRequest.call(
							this,
							'DELETE',
							`/o/${organizationId}/facts/custom`,
							{},
							{
								id: existingFact.id as string,
							},
						);
						returnData.push({ json: { success: true, ...responseData } });
					}
				}

				if (resource === 'instruction') {
					if (operation === 'get') {
						const instructionId = this.getNodeParameter('instructionId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/oa/community/scripts/${instructionId}`,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const query: IDataObject = {};
						if (filters.name) {
							query.search_text = filters.name;
						}

						if (returnAll) {
							let page = 1;
							const perPage = 100;
							let hasMore = true;

							while (hasMore) {
								const responseData = await addigyApiRequest.call(
									this,
									'POST',
									'/oa/community/scripts/query',
									{
										page,
										per_page: perPage,
										sort_direction: 'asc',
										sort_fields: ['name'],
										query,
									},
								);

								const items = getResponseItems(responseData);
								items.forEach((item: IDataObject) => {
									returnData.push({ json: item });
								});

								const metadata = getResponseMetadata(responseData);
								const currentPage = (metadata.page as number) ?? page;
								const pageCount = (metadata.page_count as number) ?? currentPage;
								hasMore = items.length > 0 && currentPage < pageCount;
								if (hasMore) {
									page += 1;
								}
							}
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const responseData = await addigyApiRequest.call(
								this,
								'POST',
								'/oa/community/scripts/query',
								{
									page: 1,
									per_page: limit,
									sort_direction: 'asc',
									sort_fields: ['name'],
									query,
								},
							);

							const items = getResponseItems(responseData);
							items.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const script = this.getNodeParameter('script', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const categories = additionalFields.category
							? [additionalFields.category as string]
							: ['General'];
						const body: IDataObject = {
							commands: [
								{
									name,
									text: script,
									categories,
									description: (additionalFields.description as string) || undefined,
								},
							],
						};

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/scripts`,
							body,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'update') {
						throw new Error('Instruction update is not exposed as a direct API v2 endpoint. Use create/delete flow.');
					}

					if (operation === 'delete') {
						const instructionId = this.getNodeParameter('instructionId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'DELETE',
							`/o/${organizationId}/scripts`,
							{},
							{
								id: instructionId,
							},
						);
						returnData.push({ json: { success: true, ...responseData } });
					}

					if (operation === 'execute') {
						const instructionId = this.getNodeParameter('instructionId', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						if (targetType !== 'device') {
							throw new Error('Instruction execute in API v2 supports device target only.');
						}
						const deviceId = this.getNodeParameter('deviceId', i) as string;

						const scriptData = await addigyApiRequest.call(
							this,
							'GET',
							`/oa/community/scripts/${instructionId}`,
						);
						const scriptObject = asDataObject(scriptData);
						const scriptText =
							(scriptObject.text as string) ||
							(scriptObject.script as string) ||
							(scriptObject.command as string);

						if (!scriptText) {
							throw new Error(`Could not retrieve executable script text for instruction ${instructionId}`);
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/o/${organizationId}/devices/commands/run`,
							{
								agent_ids: [deviceId],
								command: scriptText,
								background: true,
							},
						);
						returnData.push({ json: asDataObject(responseData) });
					}
				}

				if (resource === 'billing') {
					if (operation === 'getData') {
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/o/${organizationId}/billing/data`,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'getAccount') {
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/o/${organizationId}/billing/account`,
						);
						returnData.push({ json: asDataObject(responseData) });
					}

					if (operation === 'getInvoices') {
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/o/${organizationId}/billing/invoices`,
						);

						if (Array.isArray(responseData)) {
							responseData.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						} else {
							returnData.push({ json: asDataObject(responseData) });
						}
					}
				}
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					const message = error instanceof Error ? error.message : 'Unknown error';
					returnData.push({ json: { error: message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
