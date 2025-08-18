---
title: Welcome to My Site
---

# Welcome to My Site

This is a test page for the HTML SSG.

## Featured Trips

<ul class="trip-list">
<template data-src="example-site/data/trips.json" data-for-each="featured" data-do="trip">
	<template ref="trip-for-footer.html" />  
</template>
</ul>