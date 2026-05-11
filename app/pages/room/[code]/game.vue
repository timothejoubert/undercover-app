<script setup lang="ts">
import type { MyRoleResponse } from '~/types/api'

const route = useRoute()
const code = (route.params.code as string).toUpperCase()
const storedPlayerId = useLocalStorage('undercover:player-id', '')

const myRole = ref<MyRoleResponse | null>(null)
const loading = ref(true)
const revealed = ref(false)

import type { PlayerRole } from '~/types/api'

const roleLabel: Record<NonNullable<PlayerRole>, string> = {
    civil: 'Civil',
    undercover: 'Undercover',
    mr_white: 'Mr. White',
}

const roleColor: Record<NonNullable<PlayerRole>, string> = {
    civil: 'success',
    undercover: 'error',
    mr_white: 'neutral',
}

onMounted(async () => {
    if (!storedPlayerId.value) {
        await navigateTo('/')
        return
    }

    try {
        myRole.value = await $fetch<MyRoleResponse>(`/api/room/${code}/my-role`, {
            query: { playerId: storedPlayerId.value },
        })
    }
    catch {
        await navigateTo(`/room/${code}`)
    }
    finally {
        loading.value = false
    }
})
</script>

<template>
    <div :class="$style['root']">
        <p
            v-if="loading"
            :class="$style['loading']"
        >
            Chargement...
        </p>

        <template v-else-if="myRole">
            <!-- Avant révélation -->
            <div
                v-if="!revealed"
                :class="$style['reveal-screen']"
            >
                <div :class="$style['card-word']">
                    <p :class="$style['prompt']">
                        Ton mot secret
                    </p>
                    <div :class="$style['word-hidden']">
                        <span>● ● ● ● ●</span>
                    </div>
                    <p :class="$style['hint']">
                        Assure-toi d'être seul(e) avant de regarder
                    </p>
                </div>
                <UButton
                    size="xl"
                    block
                    :class="$style['btn-reveal']"
                    @click="revealed = true"
                >
                    Révéler mon mot
                </UButton>
            </div>

            <!-- Après révélation -->
            <div
                v-else
                :class="$style['word-screen']"
            >
                <div :class="$style['card-word']">
                    <p :class="$style['prompt']">
                        Ton mot secret
                    </p>
                    <p :class="$style['word']">
                        {{ myRole.word ?? '—' }}
                    </p>
                    <UBadge
                        :color="roleColor[myRole.role!]"
                        variant="soft"
                        size="lg"
                        :label="roleLabel[myRole.role!]"
                        :class="$style['role-badge']"
                    />
                </div>
                <p :class="$style['warning']">
                    Ne montre pas ton mot aux autres joueurs !
                </p>
                <UButton
                    size="xl"
                    block
                    :class="$style['btn-ready']"
                >
                    J'ai mémorisé mon mot
                </UButton>
            </div>
        </template>
    </div>
</template>

<style lang="scss" module>
.root {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    gap: 24px;
}

.loading {
    color: var(--ui-text-muted);
}

.reveal-screen,
.word-screen {
    display: flex;
    width: 100%;
    max-width: 420px;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

.card-word {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    padding: 40px 32px;
    border: 1px solid var(--ui-border);
    border-radius: 16px;
    background: var(--ui-bg-elevated);
    gap: 16px;
    text-align: center;
}

.prompt {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.word-hidden {
    color: var(--ui-text-muted);
    font-size: 2rem;
    letter-spacing: 0.5em;
    user-select: none;
}

.word {
    color: var(--ui-primary);
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.role-badge {
    margin-top: 4px;
}

.hint {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
}

.warning {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    text-align: center;
}

.btn-reveal,
.btn-ready {
    width: 100%;
}
</style>
