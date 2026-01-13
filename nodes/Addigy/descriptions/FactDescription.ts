import { INodeProperties } from 'n8n-workflow';

export const factOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['fact'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a custom fact',
				action: 'Create a custom fact',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a custom fact',
				action: 'Delete a custom fact',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a custom fact by name',
				action: 'Get a custom fact',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get all custom facts',
				action: 'Get many custom facts',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a custom fact',
				action: 'Update a custom fact',
			},
		],
		default: 'getAll',
	},
];

export const factFields: INodeProperties[] = [
	// ----------------------------------
	//         fact:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['fact'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the custom fact',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['fact'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'String',
				value: 'string',
			},
			{
				name: 'Number',
				value: 'number',
			},
			{
				name: 'Boolean',
				value: 'boolean',
			},
			{
				name: 'Date',
				value: 'date',
			},
		],
		default: 'string',
		description: 'Data type of the custom fact',
	},
	{
		displayName: 'Script',
		name: 'script',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['fact'],
				operation: ['create'],
			},
		},
		default: '#!/bin/bash\n# Script to collect the fact value\necho "value"',
		description: 'Shell script to collect the fact value from devices',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['fact'],
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
				description: 'Description of what this fact collects',
			},
			{
				displayName: 'Collection Frequency',
				name: 'frequency',
				type: 'options',
				options: [
					{
						name: 'Every Hour',
						value: 'hourly',
					},
					{
						name: 'Every 6 Hours',
						value: '6hours',
					},
					{
						name: 'Daily',
						value: 'daily',
					},
					{
						name: 'Weekly',
						value: 'weekly',
					},
				],
				default: 'daily',
				description: 'How often to collect this fact from devices',
			},
		],
	},

	// ----------------------------------
	//         fact:delete, get, update
	// ----------------------------------
	{
		displayName: 'Fact Name',
		name: 'factName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['fact'],
				operation: ['delete', 'get', 'update'],
			},
		},
		default: '',
		description: 'The name of the custom fact',
	},

	// ----------------------------------
	//         fact:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['fact'],
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
				resource: ['fact'],
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

	// ----------------------------------
	//         fact:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['fact'],
				operation: ['update'],
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
				description: 'Description of what this fact collects',
			},
			{
				displayName: 'Script',
				name: 'script',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				description: 'Shell script to collect the fact value from devices',
			},
			{
				displayName: 'Collection Frequency',
				name: 'frequency',
				type: 'options',
				options: [
					{
						name: 'Every Hour',
						value: 'hourly',
					},
					{
						name: 'Every 6 Hours',
						value: '6hours',
					},
					{
						name: 'Daily',
						value: 'daily',
					},
					{
						name: 'Weekly',
						value: 'weekly',
					},
				],
				default: 'daily',
				description: 'How often to collect this fact from devices',
			},
		],
	},
];
