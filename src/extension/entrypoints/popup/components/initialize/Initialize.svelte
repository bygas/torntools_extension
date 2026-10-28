<script lang="ts">
	import { loadDatabase } from "@common/utils/data/database";
	import { changeAPIKey, checkAPIPermission } from "@common/utils/functions/api-key";
	import { sleep, TO_MILLIS } from "@common/utils/functions/utilities";
	import { Button } from "@svelte/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "@svelte/components/ui/card";
	import { Input } from "@svelte/components/ui/input";
	import { replace } from "svelte-spa-router";
	import { browser } from "wxt/browser";
	import { settingsStore } from "../../stores/database-store.svelte";
	import { getStartupPath } from "../../tabs";

	let apiKey = $state("");
	let error = $state("");
	let permissionError = $state("");
	let saving = $state(false);

	async function setApiKey() {
		error = "";
		permissionError = "";
		saving = true;

		try {
			const { access } = await checkAPIPermission(apiKey.trim());
			if (!access) {
				permissionError = "TornTools için Sınırlı Erişim (Limited Access) anahtarı gerekir. Bu anahtar doğru API seviyesine sahip değil.";
				setTimeout(() => {
					permissionError = "";
				}, 10 * TO_MILLIS.SECONDS);
				return;
			}

			await changeAPIKey(apiKey.trim());
			while (!(await loadDatabase(true)).userdata.timestamp) {
				await sleep(TO_MILLIS.SECONDS);
			}
			await replace(getStartupPath($settingsStore, true));
		} catch (caughtError) {
			error = (caughtError as { error?: string; message?: string })?.error ?? (caughtError as Error).message ?? "API anahtarı kaydedilemedi.";
		} finally {
			saving = false;
		}
	}

	function openApiPage() {
		void browser.tabs.update({ url: "https://www.torn.com/preferences.php#tab=api" });
	}

	function openImport() {
		window.open(browser.runtime.getURL("/options.html#/export"));
	}
</script>

<Card size="sm" class="rounded-lg">
	<CardHeader class="px-4">
		<CardTitle class="text-base">Torn<span class="text-primary">Tools</span>'a Hoş Geldiniz</CardTitle>
	</CardHeader>
	<CardContent class="space-y-3 px-4">
		<div class="space-y-1.5">
			<label for="api-key" class="text-xs font-medium">Lütfen API anahtarınızı girin:</label>
			<Input id="api-key" bind:value={apiKey} type="text" autocomplete="off" onkeydown={(event) => event.key === "Enter" && void setApiKey()} />
		</div>

		{#if error}
			<div class="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">{error}</div>
		{/if}
		{#if permissionError}
			<div class="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">{permissionError}</div>
		{/if}

		<div class="flex gap-2">
			<Button size="sm" class="h-8 flex-1" onclick={setApiKey} disabled={saving || !apiKey.trim()}>{saving ? "Ayarlanıyor..." : "Ayarla"}</Button>
			<Button size="sm" variant="secondary" class="h-8 flex-1" onclick={openApiPage}>Anahtar sayfası</Button>
		</div>

		<div class="text-xs text-muted-foreground">TornTools için <span class="text-amber-600 dark:text-amber-300">Sınırlı Erişim (Limited Access)</span> anahtarı gerekir.</div>

		<Button size="sm" variant="outline" class="h-8 w-full" onclick={openImport}>Önceki ayarları içe aktar</Button>
		<a class="block text-xs text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer" href={browser.runtime.getURL("/tos.html")}>Kullanım Şartları</a>
	</CardContent>
</Card>
