<template>
    <div :class="$style.root">
        <main :class="$style.main">
            <slot />
        </main>
    </div>
</template>

<style lang="scss" module>
.root {
    display: flex;
    min-height: 100dvh;
    flex-direction: column;
}

.main {
    display: flex;
    flex: 1;
    flex-direction: column;
}
</style>
