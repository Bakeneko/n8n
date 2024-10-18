import type { GlobalConfig } from '@n8n/config';
import { mock } from 'jest-mock-extended';
import type { InstanceSettings } from 'n8n-core';

import config from '@/config';
import { N8N_VERSION } from '@/constants';
import { License } from '@/license';
import { mockLogger } from '@test/mocking';

const MOCK_SERVER_URL = 'https://server.com/v1';
const MOCK_RENEW_OFFSET = 259200;
const MOCK_INSTANCE_ID = 'instance-id';
const MOCK_ACTIVATION_KEY = 'activation-key';
const MOCK_FEATURE_FLAG = 'feat:sharing';
const MOCK_MAIN_PLAN_ID = '1b765dc4-d39d-4ffe-9885-c56dd67c4b26';

describe('License', () => {
	beforeAll(() => {
		config.set('license.serverUrl', MOCK_SERVER_URL);
		config.set('license.autoRenewEnabled', true);
		config.set('license.autoRenewOffset', MOCK_RENEW_OFFSET);
		config.set('license.tenantId', 1);
	});

	let license: License;
	const instanceSettings = mock<InstanceSettings>({
		instanceId: MOCK_INSTANCE_ID,
		instanceType: 'main',
	});

	beforeEach(async () => {
		const globalConfig = mock<GlobalConfig>({ multiMainSetup: { enabled: false } });
		license = new License(mockLogger(), instanceSettings, globalConfig);
		await license.init();
	});

	test('initializes license manager for worker', async () => {
		const logger = mockLogger();

		license = new License(
			logger,
			mock<InstanceSettings>({ instanceType: 'worker' }),
			mock(),
		);
		await license.init();
	});

	test('attempts to activate license with provided key', async () => {
		await license.activate(MOCK_ACTIVATION_KEY);
	});

	test('renews license', async () => {
		await license.renew();
	});

	test('check if feature is enabled', () => {
		license.isFeatureEnabled(MOCK_FEATURE_FLAG);
	});

	test('check if sharing feature is enabled', () => {
		license.isFeatureEnabled(MOCK_FEATURE_FLAG);
	});

	test('check fetching entitlements', () => {
		license.getCurrentEntitlements();
	});

	test('check fetching feature values', async () => {
		license.getFeatureValue(MOCK_FEATURE_FLAG);
	});

	test('check management jwt', async () => {
		license.getManagementJwt();
	});
});

describe('License', () => {
	beforeEach(() => {
		config.load(config.default);
	});

	describe('init', () => {
		describe('in single-main setup', () => {
			describe('with `license.autoRenewEnabled` enabled', () => {
				it('should enable renewal', async () => {
					const globalConfig = mock<GlobalConfig>({ multiMainSetup: { enabled: false } });

					await new License(mockLogger(), mock(), globalConfig).init();
				});
			});

			describe('with `license.autoRenewEnabled` disabled', () => {
				it('should disable renewal', async () => {
					config.set('license.autoRenewEnabled', false);

					await new License(mockLogger(), mock(), mock()).init();
				});
			});
		});

		describe('in multi-main setup', () => {
			describe('with `license.autoRenewEnabled` disabled', () => {
				test.each(['unset', 'leader', 'follower'])(
					'if %s status, should disable removal',
					async (status) => {
						const globalConfig = mock<GlobalConfig>({ multiMainSetup: { enabled: true } });
						config.set('multiMainSetup.instanceType', status);
						config.set('license.autoRenewEnabled', false);

						await new License(mockLogger(), mock(), globalConfig).init();
					},
				);
			});

			describe('with `license.autoRenewEnabled` enabled', () => {
				test.each(['unset', 'follower'])('if %s status, should disable removal', async (status) => {
					const globalConfig = mock<GlobalConfig>({ multiMainSetup: { enabled: true } });
					config.set('multiMainSetup.instanceType', status);
					config.set('license.autoRenewEnabled', false);

					await new License(mockLogger(), mock(), globalConfig).init();
				});

				it('if leader status, should enable renewal', async () => {
					const globalConfig = mock<GlobalConfig>({ multiMainSetup: { enabled: true } });
					config.set('multiMainSetup.instanceType', 'leader');

					await new License(mockLogger(), mock(), globalConfig).init();
				});
			});
		});
	});

	describe('reinit', () => {
		it('should reinitialize license manager', async () => {
			const license = new License(mockLogger(), mock(), mock());
			await license.init();

			const initSpy = jest.spyOn(license, 'init');

			await license.reinit();

			expect(initSpy).toHaveBeenCalledWith(true);
		});
	});
});
