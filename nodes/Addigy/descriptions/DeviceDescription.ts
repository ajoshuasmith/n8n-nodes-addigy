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
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Device name',
			},
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
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Device notes',
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
