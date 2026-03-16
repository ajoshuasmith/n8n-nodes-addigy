import { INodeProperties } from 'n8n-workflow';

export const billingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['billing'],
			},
		},
		options: [
			{
				name: 'Get Account',
				value: 'getAccount',
				description: 'Get billing account details',
				action: 'Get billing account',
			},
			{
				name: 'Get Data',
				value: 'getData',
				description: 'Get billing summary data',
				action: 'Get billing data',
			},
			{
				name: 'Get Invoices',
				value: 'getInvoices',
				description: 'Get billing invoices',
				action: 'Get billing invoices',
			},
		],
		default: 'getData',
	},
];

export const billingFields: INodeProperties[] = [];
