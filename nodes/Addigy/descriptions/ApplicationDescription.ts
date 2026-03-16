import { INodeProperties } from 'n8n-workflow';

export const applicationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['application'],
			},
		},
		options: [
			{
				name: 'Deploy',
				value: 'deploy',
				description: 'Assign smart software to a policy',
				action: 'Deploy an application',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an application by ID',
				action: 'Get an application',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many applications',
				action: 'Get many applications',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Unassign smart software from a policy',
				action: 'Remove an application',
			},
		],
		default: 'getAll',
	},
];

export const applicationFields: INodeProperties[] = [
	// ----------------------------------
	//         application:get
	// ----------------------------------
	{
		displayName: 'Application ID',
		name: 'applicationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['get', 'deploy', 'remove'],
			},
		},
		default: '',
		description: 'The ID of the application',
	},

	// ----------------------------------
	//         application:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['getAll'],
			},
		},
			options: [
				{
					displayName: 'Name',
					name: 'name',
					type: 'string',
					default: '',
					description: 'Filter by application name',
				},
			],
		},

	// ----------------------------------
	//         application:deploy
	// ----------------------------------
	{
		displayName: 'Target Type',
		name: 'targetType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['deploy', 'remove'],
			},
		},
		options: [
			{
				name: 'Policy',
				value: 'policy',
				description: 'Assign to all devices in a policy',
			},
		],
		default: 'policy',
		description: 'API v2 supports policy assignment for this operation',
	},
	{
		displayName: 'Policy Name or ID',
		name: 'policyId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPolicies',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['deploy', 'remove'],
				targetType: ['policy'],
			},
		},
		default: '',
		description: 'The policy to deploy to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
];
