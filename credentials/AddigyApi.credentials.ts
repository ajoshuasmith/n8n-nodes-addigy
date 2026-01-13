import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AddigyApi implements ICredentialType {
	name = 'addigyApi';

	displayName = 'Addigy API';

	documentationUrl = 'https://support.addigy.com/hc/en-us/articles/16938210315411-API-Documentation-v2';

	properties: INodeProperties[] = [
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'options',
			options: [
				{
					name: 'API v2 (Recommended)',
					value: 'v2',
				},
				{
					name: 'API v1 (Legacy)',
					value: 'v1',
				},
			],
			default: 'v2',
			description: 'The Addigy API version to use. v2 is recommended as v1 will be deprecated on March 31, 2026.',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					apiVersion: ['v1'],
				},
			},
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			displayOptions: {
				show: {
					apiVersion: ['v1'],
				},
			},
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			displayOptions: {
				show: {
					apiVersion: ['v2'],
				},
			},
			description: 'API v2 token with appropriate permissions for your use case',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://prod.addigy.com',
			description: 'The base URL for your Addigy instance',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}/api/v2',
			url: '/devices',
			method: 'GET',
			qs: {
				limit: 1,
			},
		},
	};
}
