import { GlobalConfig } from '@n8n/config';
import { InstanceSettings } from 'n8n-core';
import { Service } from 'typedi';

import config from '@/config';
import { OnShutdown } from '@/decorators/on-shutdown';
import { Logger } from '@/logging/logger.service';

import {
	LICENSE_FEATURES,
	LICENSE_QUOTAS,
	N8N_VERSION,
	SETTINGS_LICENSE_CERT_KEY,
	UNLIMITED_LICENSE_QUOTA,
} from './constants';
import type { BooleanLicenseFeature, NumericLicenseFeature } from './interfaces';

export type FeatureReturnType = Partial<
	{
		planName: string;
	} & { [K in NumericLicenseFeature]: number } & { [K in BooleanLicenseFeature]: boolean }
>;

@Service()
export class License {
	constructor(
		private readonly logger: Logger,
		private readonly instanceSettings: InstanceSettings,
		private readonly globalConfig: GlobalConfig,
	) {
		this.logger = this.logger.withScope('license');
	}

	private features = new Map<BooleanLicenseFeature, boolean>([
        [LICENSE_FEATURES.SHARING, true],
		[LICENSE_FEATURES.LDAP, true],
		[LICENSE_FEATURES.SAML, true],
		[LICENSE_FEATURES.LOG_STREAMING, true],
		[LICENSE_FEATURES.ADVANCED_EXECUTION_FILTERS, true],
		[LICENSE_FEATURES.VARIABLES, true],
		[LICENSE_FEATURES.SOURCE_CONTROL, true],
		[LICENSE_FEATURES.API_DISABLED, true],
		[LICENSE_FEATURES.EXTERNAL_SECRETS, true],
		[LICENSE_FEATURES.SHOW_NON_PROD_BANNER, false],
		[LICENSE_FEATURES.WORKFLOW_HISTORY, true],
		[LICENSE_FEATURES.DEBUG_IN_EDITOR, true],
		[LICENSE_FEATURES.BINARY_DATA_S3, true],
		[LICENSE_FEATURES.MULTIPLE_MAIN_INSTANCES, true],
		[LICENSE_FEATURES.WORKER_VIEW, true],
		[LICENSE_FEATURES.ADVANCED_PERMISSIONS, true],
		[LICENSE_FEATURES.PROJECT_ROLE_ADMIN, true],
		[LICENSE_FEATURES.PROJECT_ROLE_EDITOR, true],
		[LICENSE_FEATURES.PROJECT_ROLE_VIEWER, true],
		[LICENSE_FEATURES.AI_ASSISTANT, true],
		[LICENSE_FEATURES.ASK_AI, true],
		[LICENSE_FEATURES.COMMUNITY_NODES_CUSTOM_REGISTRY, true],
    ]);

	/**
	 * Whether this instance should renew the license - on init and periodically.
	 */
	private renewalEnabled() {
		if (this.instanceSettings.instanceType !== 'main') return false;

		const autoRenewEnabled = config.getEnv('license.autoRenewEnabled');

		/**
		 * In multi-main setup, all mains start off with `unset` status and so renewal disabled.
		 * On becoming leader or follower, each will enable or disable renewal, respectively.
		 * This ensures the mains do not cause a 429 (too many requests) on license init.
		 */
		if (this.globalConfig.multiMainSetup.enabled) {
			return autoRenewEnabled && this.instanceSettings.isLeader;
		}

		return autoRenewEnabled;
	}

	async init(forceRecreate = false) {
		this.logger.debug('License initialized');
	}

	async loadCertStr(): Promise<string> {
		return '666';
	}

	async activate(activationKey: string): Promise<void> {
		this.logger.debug('License activated');
	}

	async reload(): Promise<void> {
		this.logger.debug('License reloaded');
	}

	async renew() {
		this.logger.debug('License renewed');
	}

	@OnShutdown()
	async shutdown() {
		this.logger.debug('License shut down');
	}

	isFeatureEnabled(feature: BooleanLicenseFeature) {
		return this.features.get(feature) ?? true;
	}

	isSharingEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.SHARING);
	}

	isLogStreamingEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.LOG_STREAMING);
	}

	isLdapEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.LDAP);
	}

	isSamlEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.SAML);
	}

	isAiAssistantEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.AI_ASSISTANT);
	}

	isAskAiEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.ASK_AI);
	}

	isAdvancedExecutionFiltersEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.ADVANCED_EXECUTION_FILTERS);
	}

	isAdvancedPermissionsLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.ADVANCED_PERMISSIONS);
	}

	isDebugInEditorLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.DEBUG_IN_EDITOR);
	}

	isBinaryDataS3Licensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.BINARY_DATA_S3);
	}

	isMultipleMainInstancesLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.MULTIPLE_MAIN_INSTANCES);
	}

	isVariablesEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.VARIABLES);
	}

	isSourceControlLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.SOURCE_CONTROL);
	}

	isExternalSecretsEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.EXTERNAL_SECRETS);
	}

	isWorkflowHistoryLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.WORKFLOW_HISTORY);
	}

	isAPIDisabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.API_DISABLED);
	}

	isWorkerViewLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.WORKER_VIEW);
	}

	isProjectRoleAdminLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.PROJECT_ROLE_ADMIN);
	}

	isProjectRoleEditorLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.PROJECT_ROLE_EDITOR);
	}

	isProjectRoleViewerLicensed() {
		return this.isFeatureEnabled(LICENSE_FEATURES.PROJECT_ROLE_VIEWER);
	}

	isCustomNpmRegistryEnabled() {
		return this.isFeatureEnabled(LICENSE_FEATURES.COMMUNITY_NODES_CUSTOM_REGISTRY);
	}

	getCurrentEntitlements() {
		return [];
	}

	getFeatureValue<T extends keyof FeatureReturnType>(feature: T): FeatureReturnType[T] {
		return undefined;
	}

	getManagementJwt(): string {
		return '';
	}

	/**
	 * Helper function to get the main plan for a license
	 */
	getMainPlan(): any | undefined {
		return {
			id: '666',
			productId: '666',
			productMetadata: {
				terms: {
					isMainPlan: true,
				},
			},
			features: {},
			featureOverrides: {},
			validFrom: new Date(),
			validTo: new Date(),
		}
	}

	getConsumerId() {
		return 'unknown';
	}

	// Helper functions for computed data
	getUsersLimit() {
		return this.getFeatureValue(LICENSE_QUOTAS.USERS_LIMIT) ?? UNLIMITED_LICENSE_QUOTA;
	}

	getTriggerLimit() {
		return this.getFeatureValue(LICENSE_QUOTAS.TRIGGER_LIMIT) ?? UNLIMITED_LICENSE_QUOTA;
	}

	getVariablesLimit() {
		return this.getFeatureValue(LICENSE_QUOTAS.VARIABLES_LIMIT) ?? UNLIMITED_LICENSE_QUOTA;
	}

	getWorkflowHistoryPruneLimit() {
		return (
			this.getFeatureValue(LICENSE_QUOTAS.WORKFLOW_HISTORY_PRUNE_LIMIT) ?? UNLIMITED_LICENSE_QUOTA
		);
	}

	getTeamProjectLimit() {
		return this.getFeatureValue(LICENSE_QUOTAS.TEAM_PROJECT_LIMIT) ?? 0;
	}

	getPlanName(): string {
		return this.getFeatureValue('planName') ?? 'Community';
	}

	getInfo(): string {
		return 'n/a';
	}

	isWithinUsersLimit() {
		return this.getUsersLimit() === UNLIMITED_LICENSE_QUOTA;
	}

	async reinit() {
		await this.init(true);
		this.logger.debug('License reinitialized');
	}
}
