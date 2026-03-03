import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IDataObject,
} from 'n8n-workflow';

import {
	addigyApiRequest,
	addigyApiRequestAllItems,
	extractResponseData,
	getDevices,
	getPolicies,
	getApplications,
} from './GenericFunctions';

import { deviceOperations, deviceFields } from './descriptions/DeviceDescription';
import { policyOperations, policyFields } from './descriptions/PolicyDescription';
import { alertOperations, alertFields } from './descriptions/AlertDescription';
import { applicationOperations, applicationFields } from './descriptions/ApplicationDescription';
import { factOperations, factFields } from './descriptions/FactDescription';
import { instructionOperations, instructionFields } from './descriptions/InstructionDescription';

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
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'device') {
					if (operation === 'get') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/devices/${deviceId}`,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.policyId) {
							qs.policy_id = filters.policyId;
						}
						if (filters.serial_number) {
							qs.serial_number = filters.serial_number;
						}
						if (filters.status && filters.status !== 'all') {
							qs.status = filters.status;
						}
						if (filters.device_type) {
							qs.device_type = filters.device_type;
						}

						if (returnAll) {
							const responseData = await addigyApiRequestAllItems.call(
								this,
								'devices',
								'GET',
								'/devices',
								{},
								qs,
							);

							// Ensure we have an array and add each item
							const devices = Array.isArray(responseData) ? responseData : [];
							devices.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs.limit = limit;
							const responseData = await addigyApiRequest.call(
								this,
								'GET',
								'/devices',
								{},
								qs,
							);

							// Safely extract devices from response
							const devices = extractResponseData(responseData, 'devices');
							devices.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'getFacts') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/devices/${deviceId}/facts`,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'update') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const body: IDataObject = {};

						if (updateFields.name) {
							body.name = updateFields.name;
						}
						if (updateFields.policyId) {
							body.policy_id = updateFields.policyId;
						}
						if (updateFields.notes) {
							body.notes = updateFields.notes;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'PUT',
							`/devices/${deviceId}`,
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'runCommand') {
						const deviceId = this.getNodeParameter('deviceId', i) as string;
						const command = this.getNodeParameter('command', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {
							command,
						};

						if (additionalFields.message) {
							body.message = additionalFields.message;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							`/devices/${deviceId}/commands`,
							body,
						);
						returnData.push({ json: responseData });
					}
				}

				if (resource === 'policy') {
					if (operation === 'get') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/policies/${policyId}`,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.name) {
							qs.name = filters.name;
						}

						if (returnAll) {
							const responseData = await addigyApiRequestAllItems.call(
								this,
								'policies',
								'GET',
								'/policies',
								{},
								qs,
							);

							const policies = Array.isArray(responseData) ? responseData : [];
							policies.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs.limit = limit;
							const responseData = await addigyApiRequest.call(
								this,
								'GET',
								'/policies',
								{},
								qs,
							);

							const policies = extractResponseData(responseData, 'policies');
							policies.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
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
							'/policies',
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'update') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const body: IDataObject = {};

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
							`/policies/${policyId}`,
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'delete') {
						const policyId = this.getNodeParameter('policyId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'DELETE',
							`/policies/${policyId}`,
						);
						returnData.push({ json: { success: true, ...responseData } });
					}
				}

				if (resource === 'alert') {
					if (operation === 'get') {
						const alertId = this.getNodeParameter('alertId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/alerts/${alertId}`,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.deviceId) {
							qs.device_id = filters.deviceId;
						}
						if (filters.policyId) {
							qs.policy_id = filters.policyId;
						}
						if (filters.status && filters.status !== 'all') {
							qs.status = filters.status;
						}
						if (filters.severity) {
							qs.severity = filters.severity;
						}
						if (filters.start_date) {
							qs.start_date = filters.start_date;
						}
						if (filters.end_date) {
							qs.end_date = filters.end_date;
						}

						if (returnAll) {
							const responseData = await addigyApiRequestAllItems.call(
								this,
								'alerts',
								'GET',
								'/alerts',
								{},
								qs,
							);

							const alerts = Array.isArray(responseData) ? responseData : [];
							alerts.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs.limit = limit;
							const responseData = await addigyApiRequest.call(
								this,
								'GET',
								'/alerts',
								{},
								qs,
							);

							const alerts = extractResponseData(responseData, 'alerts');
							alerts.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'resolve') {
						const alertId = this.getNodeParameter('alertId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {
							status: 'resolved',
						};

						if (additionalFields.notes) {
							body.notes = additionalFields.notes;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'PUT',
							`/alerts/${alertId}`,
							body,
						);
						returnData.push({ json: responseData });
					}
				}

				if (resource === 'application') {
					if (operation === 'get') {
						const applicationId = this.getNodeParameter('applicationId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/applications/${applicationId}`,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.name) {
							qs.name = filters.name;
						}
						if (filters.category && filters.category !== 'all') {
							qs.category = filters.category;
						}

						if (returnAll) {
							const responseData = await addigyApiRequestAllItems.call(
								this,
								'applications',
								'GET',
								'/applications',
								{},
								qs,
							);

							const applications = Array.isArray(responseData) ? responseData : [];
							applications.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs.limit = limit;
							const responseData = await addigyApiRequest.call(
								this,
								'GET',
								'/applications',
								{},
								qs,
							);

							const applications = extractResponseData(responseData, 'applications');
							applications.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'deploy') {
						const applicationId = this.getNodeParameter('applicationId', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {
							application_id: applicationId,
						};

						if (targetType === 'device') {
							const deviceId = this.getNodeParameter('deviceId', i) as string;
							body.device_id = deviceId;
						} else {
							const policyId = this.getNodeParameter('policyId', i) as string;
							body.policy_id = policyId;
						}

						if (additionalFields.install_immediately !== undefined) {
							body.install_immediately = additionalFields.install_immediately;
						}
						if (additionalFields.auto_update !== undefined) {
							body.auto_update = additionalFields.auto_update;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/applications/deploy',
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'remove') {
						const applicationId = this.getNodeParameter('applicationId', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						const body: IDataObject = {
							application_id: applicationId,
						};

						if (targetType === 'device') {
							const deviceId = this.getNodeParameter('deviceId', i) as string;
							body.device_id = deviceId;
						} else {
							const policyId = this.getNodeParameter('policyId', i) as string;
							body.policy_id = policyId;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/applications/remove',
							body,
						);
						returnData.push({ json: responseData });
					}
				}

				if (resource === 'fact') {
					if (operation === 'get') {
						const factName = this.getNodeParameter('factName', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'GET',
							`/facts/${factName}`,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);

						if (returnAll) {
							const responseData = await addigyApiRequestAllItems.call(
								this,
								'facts',
								'GET',
								'/facts',
							);

							const facts = Array.isArray(responseData) ? responseData : [];
							facts.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						} else {
							const limit = this.getNodeParameter('limit', i);
							const qs: IDataObject = { limit };
							const responseData = await addigyApiRequest.call(
								this,
								'GET',
								'/facts',
								{},
								qs,
							);

							const facts = extractResponseData(responseData, 'facts');
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
							type,
							script,
						};

						if (additionalFields.description) {
							body.description = additionalFields.description;
						}
						if (additionalFields.frequency) {
							body.frequency = additionalFields.frequency;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/facts',
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'update') {
						const factName = this.getNodeParameter('factName', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const body: IDataObject = {};

						if (updateFields.description) {
							body.description = updateFields.description;
						}
						if (updateFields.script) {
							body.script = updateFields.script;
						}
						if (updateFields.frequency) {
							body.frequency = updateFields.frequency;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'PUT',
							`/facts/${factName}`,
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'delete') {
						const factName = this.getNodeParameter('factName', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'DELETE',
							`/facts/${factName}`,
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
							`/instructions/${instructionId}`,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.name) {
							qs.name = filters.name;
						}
						if (filters.category) {
							qs.category = filters.category;
						}

						if (returnAll) {
							const responseData = await addigyApiRequestAllItems.call(
								this,
								'instructions',
								'GET',
								'/instructions',
								{},
								qs,
							);

							const instructions = Array.isArray(responseData) ? responseData : [];
							instructions.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						} else {
							const limit = this.getNodeParameter('limit', i);
							qs.limit = limit;
							const responseData = await addigyApiRequest.call(
								this,
								'GET',
								'/instructions',
								{},
								qs,
							);

							const instructions = extractResponseData(responseData, 'instructions');
							instructions.forEach((item: IDataObject) => {
								returnData.push({ json: item });
							});
						}
					}

					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const script = this.getNodeParameter('script', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {
							name,
							script,
						};

						if (additionalFields.description) {
							body.description = additionalFields.description;
						}
						if (additionalFields.category) {
							body.category = additionalFields.category;
						}
						if (additionalFields.requires_user_context !== undefined) {
							body.requires_user_context = additionalFields.requires_user_context;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/instructions',
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'update') {
						const instructionId = this.getNodeParameter('instructionId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						const body: IDataObject = {};

						if (updateFields.name) {
							body.name = updateFields.name;
						}
						if (updateFields.description) {
							body.description = updateFields.description;
						}
						if (updateFields.script) {
							body.script = updateFields.script;
						}
						if (updateFields.category) {
							body.category = updateFields.category;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'PUT',
							`/instructions/${instructionId}`,
							body,
						);
						returnData.push({ json: responseData });
					}

					if (operation === 'delete') {
						const instructionId = this.getNodeParameter('instructionId', i) as string;
						const responseData = await addigyApiRequest.call(
							this,
							'DELETE',
							`/instructions/${instructionId}`,
						);
						returnData.push({ json: { success: true, ...responseData } });
					}

					if (operation === 'execute') {
						const instructionId = this.getNodeParameter('instructionId', i) as string;
						const targetType = this.getNodeParameter('targetType', i) as string;
						const body: IDataObject = {
							instruction_id: instructionId,
						};

						if (targetType === 'device') {
							const deviceId = this.getNodeParameter('deviceId', i) as string;
							body.device_id = deviceId;
						} else {
							const policyId = this.getNodeParameter('policyId', i) as string;
							body.policy_id = policyId;
						}

						const responseData = await addigyApiRequest.call(
							this,
							'POST',
							'/instructions/execute',
							body,
						);
						returnData.push({ json: responseData });
					}
				}
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
