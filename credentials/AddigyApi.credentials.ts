import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AddigyApi implements ICredentialType {
	name = 'addigyApi';

	displayName = 'Addigy API';

	documentationUrl = 'https://api.addigy.com/api/v2/documentation/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Addigy v2 API token (x-api-key)',
		},
		{
			displayName: 'Organization ID',
			name: 'organizationId',
			type: 'string',
			default: '',
			required: true,
			description: 'Organization ID used by organization-scoped API endpoints',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.addigy.com',
			description: 'The base URL for your Addigy instance',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v2/configuration/permissions',
			method: 'GET',
			headers: {
				'x-api-key': '={{$credentials.apiToken}}',
			},
		},
	};
}
