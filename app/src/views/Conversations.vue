<template>
	{{ id }}
</template>

<script setup lang="ts">
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();

const id = route.params.id;

axios.get();
</script>

<style scoped></style>
