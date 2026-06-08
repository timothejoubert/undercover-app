<script setup lang="ts">
import type { GameMode } from '~/types/game'

const mode = ref<'home' | 'create' | 'join'>('home')
const playerName = ref('')
const roomCode = ref('')
const selectedMode = ref<GameMode>('local')
const loading = ref(false)
const errorMessage = ref('')

const { createRoom, joinRoom } = useGame()

const gameModeOptions: Array<{ value: GameMode, label: string, description: string, soon: boolean }> = [
    {
        value: 'local',
        label: '📱 Pass-the-phone',
        description: 'Un seul téléphone pour tout le monde',
        soon: false,
    },
    {
        value: 'remote',
        label: '🌐 Chaque joueur connecté',
        description: 'Chacun sur son téléphone',
        soon: true,
    },
]

function resetToHome() {
    mode.value = 'home'
    playerName.value = ''
    roomCode.value = ''
    selectedMode.value = 'local'
    errorMessage.value = ''
}

async function handleCreate() {
    loading.value = true
    errorMessage.value = ''
    try {
        await createRoom(playerName.value, selectedMode.value)
    }
    catch (e: unknown) {
        errorMessage.value = e instanceof Error ? e.message : 'Une erreur est survenue'
        loading.value = false
    }
}

async function handleJoin() {
    loading.value = true
    errorMessage.value = ''
    try {
        await joinRoom(roomCode.value, playerName.value)
    }
    catch (e: unknown) {
        errorMessage.value = e instanceof Error ? e.message : 'Une erreur est survenue'
        loading.value = false
    }
}
</script>

<template>
    <div :class="$style['root']">
        <header :class="$style['header']">
            <h1 :class="$style['title']">
                Undercover
            </h1>
            <p :class="$style['subtitle']">
                Le jeu d'infiltration entre amis
            </p>
        </header>

        <!-- Home -->
        <UCard
            v-if="mode === 'home'"
            :class="$style['card']"
        >
            <div :class="$style['actions']">
                <UButton
                    size="xl"
                    block
                    @click="mode = 'create'"
                >
                    Créer une partie
                </UButton>
                <UButton
                    size="xl"
                    variant="outline"
                    block
                    @click="mode = 'join'"
                >
                    Rejoindre une partie
                </UButton>
            </div>
        </UCard>

        <!-- Create room -->
        <UCard
            v-else-if="mode === 'create'"
            :class="$style['card']"
        >
            <div :class="$style['card-inner']">
                <h2 :class="$style['card-title']">
                    Nouvelle partie
                </h2>

                <UInput
                    v-model="playerName"
                    label="Ton prénom"
                    placeholder="ex: Thomas"
                    :maxlength="24"
                    autocomplete="given-name"
                    size="lg"
                />

                <!-- Mode de jeu -->
                <div :class="$style['mode-section']">
                    <p :class="$style['mode-label']">
                        Mode de jeu
                    </p>
                    <div :class="$style['mode-options']">
                        <button
                            v-for="option in gameModeOptions"
                            :key="option.value"
                            :class="[
                                $style['mode-option'],
                                selectedMode === option.value && $style['mode-option--selected'],
                                option.soon && $style['mode-option--disabled'],
                            ]"
                            :disabled="option.soon"
                            @click="!option.soon && (selectedMode = option.value)"
                        >
                            <span :class="$style['mode-option-label']">{{ option.label }}</span>
                            <span :class="$style['mode-option-desc']">{{ option.description }}</span>
                            <span
                                v-if="option.soon"
                                :class="$style['mode-option-badge']"
                            >Bientôt</span>
                        </button>
                    </div>
                </div>

                <UAlert
                    v-if="errorMessage"
                    color="error"
                    variant="soft"
                    :description="errorMessage"
                />
                <div :class="$style['card-footer']">
                    <UButton
                        variant="ghost"
                        :disabled="loading"
                        @click="resetToHome"
                    >
                        Retour
                    </UButton>
                    <UButton
                        :disabled="playerName.trim().length < 2"
                        :loading="loading"
                        @click="handleCreate"
                    >
                        Créer la room
                    </UButton>
                </div>
            </div>
        </UCard>

        <!-- Join room -->
        <UCard
            v-else-if="mode === 'join'"
            :class="$style['card']"
        >
            <div :class="$style['card-inner']">
                <h2 :class="$style['card-title']">
                    Rejoindre une partie
                </h2>
                <UInput
                    v-model="playerName"
                    label="Ton prénom"
                    placeholder="ex: Thomas"
                    :maxlength="24"
                    autocomplete="given-name"
                    size="lg"
                />
                <UInput
                    v-model="roomCode"
                    label="Code de la room"
                    placeholder="ex: AB12CD"
                    :maxlength="6"
                    size="lg"
                    hint="Le code à 6 caractères partagé par l'hôte"
                    @input="roomCode = roomCode.toUpperCase()"
                />
                <UAlert
                    v-if="errorMessage"
                    color="error"
                    variant="soft"
                    :description="errorMessage"
                />
                <div :class="$style['card-footer']">
                    <UButton
                        variant="ghost"
                        :disabled="loading"
                        @click="resetToHome"
                    >
                        Retour
                    </UButton>
                    <UButton
                        :disabled="playerName.trim().length < 2 || roomCode.trim().length !== 6"
                        :loading="loading"
                        @click="handleJoin"
                    >
                        Rejoindre
                    </UButton>
                </div>
            </div>
        </UCard>
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
    gap: 32px;
}

.header {
    text-align: center;
}

.title {
    color: var(--ui-primary);
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.subtitle {
    margin-top: 8px;
    color: var(--ui-text-muted);
    font-size: 1.0625rem;
}

.card {
    width: 100%;
    max-width: 420px;
}

.card-inner {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-title {
    font-size: 1.25rem;
    font-weight: 600;
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
}

// Mode selector
.mode-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mode-label {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    font-weight: 500;
}

.mode-options {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr 1fr;
}

.mode-option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    border: 2px solid var(--ui-border);
    border-radius: 10px;
    background: var(--ui-bg-elevated);
    cursor: pointer;
    gap: 4px;
    text-align: left;
    transition: border-color 0.15s, background 0.15s;

    &:hover:not(:disabled) {
        border-color: color-mix(in srgb, var(--ui-primary) 40%, transparent);
    }
}

.mode-option--selected {
    border-color: var(--ui-primary);
    background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}

.mode-option--disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.mode-option-label {
    font-size: 0.9375rem;
    font-weight: 600;
}

.mode-option-desc {
    color: var(--ui-text-muted);
    font-size: 0.75rem;
    line-height: 1.3;
}

.mode-option-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--ui-bg-accented);
    color: var(--ui-text-muted);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}
</style>
