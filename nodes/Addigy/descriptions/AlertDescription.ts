import { INodeProperties } from 'n8n-workflow';

export const alertOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['alert'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get an alert by ID',
				action: 'Get an alert',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many alerts',
				action: 'Get many alerts',
			},
			{
				name: 'Resolve',
				value: 'resolve',
				description: 'Resolve an alert',
				action: 'Resolve an alert',
			},
		],
		default: 'getAll',
	},
];

export const alertFields: INodeProperties[] = [
	// ----------------------------------
	//         alert:get
	// ----------------------------------
	{
		displayName: 'Alert ID',
		name: 'alertId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['get', 'resolve'],
			},
		},
		default: '',
		description: 'The ID of the alert',
	},

	// ----------------------------------
	//         alert:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['alert'],
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
				resource: ['alert'],
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
				resource: ['alert'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Device Name or ID',
				name: 'deviceId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getDevices',
				},
				default: '',
				description: 'Filter alerts by device. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Policy Name or ID',
				name: 'policyId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPolicies',
				},
				default: '',
				description: 'Filter alerts by policy. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Open',
						value: 'open',
					},
					{
						name: 'Resolved',
						value: 'resolved',
					},
					{
						name: 'All',
						value: 'all',
					},
				],
				default: 'open',
				description: 'Filter by alert status',
			},
			{
				displayName: 'Severity',
				name: 'severity',
				type: 'options',
				options: [
					{
						name: 'Critical',
						value: 'critical',
					},
					{
						name: 'Warning',
						value: 'warning',
					},
					{
						name: 'Info',
						value: 'info',
					},
				],
				default: 'critical',
				description: 'Filter by alert severity',
			},
			{
				displayName: 'Start Date',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'Get alerts created after this date',
			},
			{
				displayName: 'End Date',
				name: 'end_date',
				type: 'dateTime',
				default: '',
				description: 'Get alerts created before this date',
			},
		],
	},

	// ----------------------------------
	//         alert:resolve
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['alert'],
				operation: ['resolve'],
			},
		},
		options: [
			{
				displayName: 'Resolution Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the alert resolution',
			},
		],
	},
];
