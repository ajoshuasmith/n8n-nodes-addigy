import { INodeProperties } from 'n8n-workflow';

export const policyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['policy'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a policy',
				action: 'Create a policy',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a policy',
				action: 'Delete a policy',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a policy by ID',
				action: 'Get a policy',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many policies',
				action: 'Get many policies',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a policy',
				action: 'Update a policy',
			},
		],
		default: 'getAll',
	},
];

export const policyFields: INodeProperties[] = [
	// ----------------------------------
	//         policy:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the policy',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Policy description',
			},
			{
				displayName: 'Parent Policy Name or ID',
				name: 'parent_policy_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPolicies',
				},
				default: '',
				description: 'Parent policy to inherit from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#3B82F6',
				description: 'Color for the policy in the UI',
			},
		],
	},

	// ----------------------------------
	//         policy:delete
	// ----------------------------------
	{
		displayName: 'Policy ID',
		name: 'policyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['delete', 'get', 'update'],
			},
		},
		default: '',
		description: 'The ID of the policy',
	},

	// ----------------------------------
	//         policy:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['policy'],
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
				resource: ['policy'],
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
				resource: ['policy'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by policy name',
			},
		],
	},

	// ----------------------------------
	//         policy:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['policy'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Policy name',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Policy description',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#3B82F6',
				description: 'Color for the policy in the UI',
			},
		],
	},
];
