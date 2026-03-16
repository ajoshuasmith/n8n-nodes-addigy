import { INodeProperties } from 'n8n-workflow';

export const instructionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['instruction'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create an instruction',
				action: 'Create an instruction',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an instruction',
				action: 'Delete an instruction',
			},
			{
				name: 'Execute',
				value: 'execute',
				description: 'Execute an instruction on devices',
				action: 'Execute an instruction',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an instruction by ID',
				action: 'Get an instruction',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many instructions',
				action: 'Get many instructions',
			},
		],
		default: 'getAll',
	},
];

export const instructionFields: INodeProperties[] = [
	// ----------------------------------
	//         instruction:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['instruction'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the instruction',
	},
	{
		displayName: 'Script',
		name: 'script',
		type: 'string',
		typeOptions: {
			rows: 15,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['instruction'],
				operation: ['create'],
			},
		},
		default: '#!/bin/bash\n# Your instruction script here\n',
		description: 'Shell script to execute on devices',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['instruction'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Description of what this instruction does',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				description: 'Category to organize instructions',
			},
		],
	},

	// ----------------------------------
	//         instruction:delete, get, update, execute
	// ----------------------------------
	{
		displayName: 'Instruction ID',
		name: 'instructionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['instruction'],
				operation: ['delete', 'get', 'execute'],
			},
		},
		default: '',
		description: 'The ID of the instruction',
	},

	// ----------------------------------
	//         instruction:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['instruction'],
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
				resource: ['instruction'],
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
				resource: ['instruction'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by instruction name',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				default: '',
				description: 'Filter by category',
			},
		],
	},

	// ----------------------------------
	//         instruction:execute
	// ----------------------------------
	{
		displayName: 'Target Type',
		name: 'targetType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['instruction'],
				operation: ['execute'],
			},
		},
		options: [
			{
				name: 'Device',
				value: 'device',
				description: 'Execute on specific devices',
			},
		],
		default: 'device',
		description: 'API v2 execution is supported for device targets',
	},
	{
		displayName: 'Device Name or ID',
		name: 'deviceId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDevices',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['instruction'],
				operation: ['execute'],
				targetType: ['device'],
			},
		},
		default: '',
		description: 'The device to execute on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
];
