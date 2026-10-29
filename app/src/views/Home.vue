<template>
	<div class="w-full h-svh flex">
		<template
			v-if="conversations"
			v-for="[id, { contacts, messages }] in conversations.entries()">
			<div class="w-1/4">
				<RouterLink :to="`/c/${id}`">
					<div class="p-4 border-b">
						<p class="p-1">{{ contacts[0].profile.name }}: {{ messages[0].from }}</p>
						<p class="p-2 text-sm text-muted-foreground">
							{{ messages[0].text.body }}
						</p>
					</div>
				</RouterLink>
			</div>
		</template>
		<div class="w-3/4 bg-amber-500">
			<RouterView />
		</div>
	</div>
</template>

<script setup lang="ts">
import { inject, type Reactive } from 'vue';

const conversations: Reactive<Map<string, any>> | undefined = inject('conversations');
</script>

<style scoped></style>
