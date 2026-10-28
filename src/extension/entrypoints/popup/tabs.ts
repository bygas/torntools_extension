import type { DatabaseSettings } from "@common/utils/data/database";

export type PopupTabKey = "dashboard" | "marketSearch" | "calculator" | "stocksOverview" | "notifications";

export interface PopupTab {
	key: PopupTabKey;
	label: string;
	path: string;
}

const POPUP_TABS: PopupTab[] = [
	{ key: "dashboard", label: "Panel", path: "/dashboard" },
	{ key: "marketSearch", label: "Pazar", path: "/market" },
	{ key: "calculator", label: "Hesap Makinesi", path: "/calculator" },
	{ key: "stocksOverview", label: "Hisseler", path: "/stocks" },
	{ key: "notifications", label: "Bildirimler", path: "/notifications" },
];

export function getEnabledPopupTabs(settings: DatabaseSettings | undefined) {
	if (!settings?.pages?.popup) return [];

	return POPUP_TABS.filter((tab) => settings.pages.popup[tab.key]);
}

export function getStartupPath(settings: DatabaseSettings | undefined, hasApiKey: boolean) {
	if (!hasApiKey) return "/initialize";

	const enabledTabs = getEnabledPopupTabs(settings);
	const defaultTab = enabledTabs.find((tab) => tab.key === settings?.pages?.popup?.defaultTab);

	return defaultTab?.path ?? enabledTabs[0]?.path ?? "/dashboard";
}
