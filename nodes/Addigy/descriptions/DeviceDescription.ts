import { INodeProperties } from 'n8n-workflow';

export const deviceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['device'],
			},
		},
		options: [
			{
				name: 'Count',
				value: 'count',
				description: 'Get total number of devices',
				action: 'Count devices',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a device by ID',
				action: 'Get a device',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many devices',
				action: 'Get many devices',
			},
			{
				name: 'Get Facts',
				value: 'getFacts',
				description: 'Get device facts',
				action: 'Get device facts',
			},
			{
				name: 'Run Command',
				value: 'runCommand',
				description: 'Run a command on a device',
				action: 'Run command on device',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a device',
				action: 'Update a device',
			},
		],
		default: 'getAll',
	},
];

export const deviceFields: INodeProperties[] = [
	// ----------------------------------
	//         device:get
	// ----------------------------------
	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['get', 'getFacts', 'update', 'runCommand'],
			},
		},
		default: '',
		description: 'The ID of the device',
	},

	// ----------------------------------
	//         device:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['device'],
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
				resource: ['device'],
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
				resource: ['device'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Policy Name or ID',
				name: 'policyId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPolicies',
				},
				default: '',
				description: 'Filter devices by policy. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Serial Number',
				name: 'serial_number',
				type: 'string',
				default: '',
				description: 'Filter by device serial number',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Online',
						value: 'online',
					},
					{
						name: 'Offline',
						value: 'offline',
					},
					{
						name: 'All',
						value: 'all',
					},
				],
				default: 'all',
				description: 'Filter by device online status',
			},
			{
				displayName: 'Device Type',
				name: 'device_type',
				type: 'options',
				options: [
					{
						name: 'Mac',
						value: 'mac',
					},
					{
						name: 'iPhone',
						value: 'iphone',
					},
					{
						name: 'iPad',
						value: 'ipad',
					},
					{
						name: 'Apple TV',
						value: 'appletv',
					},
				],
				default: 'mac',
				description: 'Filter by device type',
			},
			{
				displayName: 'Fact Filters',
				name: 'factFilters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Fact Filter',
				default: {},
				options: [
					{
						name: 'factFilter',
						displayName: 'Fact Filter',
						values: [
							{
								displayName: 'Fact Name',
								name: 'factName',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getDeviceFactKeys',
								},
								default: '',
								description: 'Fact key to filter by. Choose from detected facts, or use an expression for custom keys.',
							},
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Equals', value: 'equals' },
									{ name: 'Contains', value: 'contains' },
									{ name: 'Starts With', value: 'starts_with' },
									{ name: 'Ends With', value: 'ends_with' },
									{ name: 'Greater Than', value: 'greater_than' },
									{ name: 'Less Than', value: 'less_than' },
									{ name: 'Exists', value: 'exists' },
								],
								default: 'equals',
								description: 'Comparison operation for the fact filter',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'String', value: 'string' },
									{ name: 'Number', value: 'number' },
									{ name: 'Boolean', value: 'boolean' },
									{ name: 'Date', value: 'date' },
								],
								default: 'string',
								description: 'Data type for the value comparison',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Filter value. Supports expressions.',
							},
							{
								displayName: 'Range Value',
								name: 'rangeValue',
								type: 'string',
								default: '',
								description: 'Optional second value for range-style comparisons',
							},
						],
					},
				],
				description: 'Advanced Addigy fact filters (mapped to query.filters)',
			},
		],
	},
	{
		displayName: 'Count Filters',
		name: 'countFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['count'],
			},
		},
		options: [
			{
				displayName: 'Policy Name or ID',
				name: 'policyId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPolicies',
				},
				default: '',
				description: 'Count devices in a specific policy. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Search Any',
				name: 'searchAny',
				type: 'string',
				default: '',
				description: 'Search text matched across device fields',
			},
			{
				displayName: 'Fact Filters',
				name: 'factFilters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Fact Filter',
				default: {},
				options: [
					{
						name: 'factFilter',
						displayName: 'Fact Filter',
						values: [
							{
								displayName: 'Fact Name',
								name: 'factName',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getDeviceFactKeys',
								},
								default: '',
								description: 'Fact key to filter by. Choose from detected facts, or use an expression for custom keys.',
							},
							{
								displayName: 'Operator',
								name: 'operator',
								type: 'options',
								options: [
									{ name: 'Equals', value: 'equals' },
									{ name: 'Contains', value: 'contains' },
									{ name: 'Starts With', value: 'starts_with' },
									{ name: 'Ends With', value: 'ends_with' },
									{ name: 'Greater Than', value: 'greater_than' },
									{ name: 'Less Than', value: 'less_than' },
									{ name: 'Exists', value: 'exists' },
								],
								default: 'equals',
								description: 'Comparison operation for the fact filter',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'String', value: 'string' },
									{ name: 'Number', value: 'number' },
									{ name: 'Boolean', value: 'boolean' },
									{ name: 'Date', value: 'date' },
								],
								default: 'string',
								description: 'Data type for the value comparison',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Filter value. Supports expressions.',
							},
							{
								displayName: 'Range Value',
								name: 'rangeValue',
								type: 'string',
								default: '',
								description: 'Optional second value for range-style comparisons',
							},
						],
					},
				],
				description: 'Advanced Addigy fact filters (mapped to query.filters)',
			},
		],
	},

	// ----------------------------------
	//         device:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Policy Name or ID',
				name: 'policyId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPolicies',
				},
				default: '',
				description: 'Assign device to a policy. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
		],
	},

	// ----------------------------------
	//         device:runCommand
	// ----------------------------------
	{
		displayName: 'Command',
		name: 'command',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['runCommand'],
			},
		},
		options: [
			{
				name: 'Restart',
				value: 'restart',
				description: 'Restart the device',
			},
			{
				name: 'Shutdown',
				value: 'shutdown',
				description: 'Shutdown the device',
			},
			{
				name: 'Lock',
				value: 'lock',
				description: 'Lock the device',
			},
			{
				name: 'Clear Passcode',
				value: 'clear_passcode',
				description: 'Clear device passcode',
			},
			{
				name: 'Refresh Facts',
				value: 'refresh_facts',
				description: 'Refresh device facts',
			},
		],
		default: 'refresh_facts',
		description: 'Command to run on the device',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['device'],
				operation: ['runCommand'],
			},
		},
		options: [
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				description: 'Optional message to display to the user',
			},
		],
	},
];
