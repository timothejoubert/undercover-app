<script setup lang="ts">
import type { Role, Player } from '~/types/game'

const route = useRoute()
const code = (route.params.code as string).toUpperCase()

const {
    room, players, alivePlayers, descriptions, winner, currentRound, voteResults,
    pendingDistributionPlayer, pendingDescriptionPlayer, pendingVotePlayer,
    getPlayerWord, markWordSeen,
    startDescribing, submitDescription,
    startVoting, submitVote, resolveVote,
    nextRound, reset,
} = useGame()

// ── Local UI state ─────────────────────────────────────────────────────────────
// Distribution
const revealed = ref(false)
const currentWord = ref<{ role: Role, word: string } | null>(null)
// Describing
const waitingForDescriber = ref(false)
const descriptionInput = ref('')
const showAllDescriptions = ref(false)
// Voting
const waitingForVoter = ref(false)
const selectedVoteTarget = ref<string | null>(null)
const showVoteRecap = ref(false)
const eliminationResult = ref<Player | null>(null)

const roleLabel: Record<Role, string> = { civil: 'Civil', undercover: 'Undercover', mr_white: 'Mr. White' }
const roleColor: Record<Role, string> = { civil: 'success', undercover: 'error', mr_white: 'neutral' }

onMounted(() => {
    if (!room.value || room.value.code !== code) navigateTo('/')
})

// Sync local UI state when room status changes
watch(() => room.value?.status, (status) => {
    if (status === 'describing') {
        waitingForDescriber.value = true
        showAllDescriptions.value = false
    }
    if (status === 'voting') {
        waitingForVoter.value = true
        showVoteRecap.value = false
        eliminationResult.value = null
    }
}, { immediate: true })

// ── Distribution ───────────────────────────────────────────────────────────────
const reviewingPlayer = ref<Player | null>(null)

const lastSeenPlayer = computed(() =>
    [...players.value].reverse().find(p => p.hasSeenWord) ?? null)

function handleReveal() {
    if (!pendingDistributionPlayer.value) return
    reviewingPlayer.value = null
    currentWord.value = getPlayerWord(pendingDistributionPlayer.value.id)
    revealed.value = true
}

function handleWordSeen() {
    if (!pendingDistributionPlayer.value) return
    markWordSeen(pendingDistributionPlayer.value.id)
    revealed.value = false
    currentWord.value = null
}

function handleReviewPrevious() {
    if (!lastSeenPlayer.value) return
    reviewingPlayer.value = lastSeenPlayer.value
    currentWord.value = getPlayerWord(lastSeenPlayer.value.id)
    revealed.value = true
}

function handleCloseReview() {
    reviewingPlayer.value = null
    revealed.value = false
    currentWord.value = null
}

// ── Describing ─────────────────────────────────────────────────────────────────
function handleSubmitDescription() {
    if (!pendingDescriptionPlayer.value) return
    // Check if this is the last player BEFORE submitting (computed not yet updated)
    const isLast = alivePlayers.value
        .filter(p => !descriptions.value.some(d => d.playerId === p.id)).length === 1
    submitDescription(pendingDescriptionPlayer.value.id, descriptionInput.value)
    descriptionInput.value = ''
    if (isLast) {
        showAllDescriptions.value = true
    }
    else {
        waitingForDescriber.value = true
    }
}

// ── Voting ─────────────────────────────────────────────────────────────────────
function handleSubmitVote() {
    if (!pendingVotePlayer.value || !selectedVoteTarget.value) return
    // Check if this is the last voter BEFORE submitting
    const isLast = alivePlayers.value
        .filter(p => !votes.value.some(v => v.voterId === p.id)).length === 1
    submitVote(pendingVotePlayer.value.id, selectedVoteTarget.value)
    selectedVoteTarget.value = null
    if (isLast) {
        showVoteRecap.value = true
    }
    else {
        waitingForVoter.value = true
    }
}

function handleRevealElimination() {
    showVoteRecap.value = false
    eliminationResult.value = resolveVote()
}

function handleContinueAfterElimination() {
    eliminationResult.value = null
    if (room.value?.status !== 'result') nextRound()
}

// Progress helpers
const descriptionProgress = computed(() =>
    `${descriptions.value.length} / ${alivePlayers.value.length}`)

const voteProgress = computed(() =>
    `${votes.value.length} / ${alivePlayers.value.length}`)
</script>

<template>
    <div :class="$style['root']">
        <!-- ═══ DISTRIBUTION ═══════════════════════════════════════════════════ -->
        <template v-if="room?.status === 'distributing'">
            <!-- Écran de verrouillage -->
            <div
                v-if="!revealed"
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Au tour de
                    </p>
                    <p :class="$style['player-name']">
                        {{ pendingDistributionPlayer?.name }}
                    </p>
                    <p :class="$style['hint']">
                        Passe le téléphone à {{ pendingDistributionPlayer?.name }}<br>
                        et assure-toi que les autres ne regardent pas
                    </p>
                </div>
                <UButton
                    size="xl"
                    block
                    @click="handleReveal"
                >
                    Révéler mon mot
                </UButton>
                <UButton
                    v-if="lastSeenPlayer"
                    variant="ghost"
                    block
                    :class="$style['btn-back']"
                    @click="handleReviewPrevious"
                >
                    ← {{ lastSeenPlayer.name }} a oublié son mot
                </UButton>
            </div>

            <!-- Mot révélé (normal ou révision) -->
            <div
                v-else
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        {{ reviewingPlayer ? `Mot de ${reviewingPlayer.name}` : 'Ton mot secret' }}
                    </p>
                    <p :class="$style['big-word']">
                        {{ currentWord?.word ?? '—' }}
                    </p>
                    <UBadge
                        v-if="currentWord?.role"
                        :color="roleColor[currentWord.role]"
                        variant="soft"
                        size="lg"
                        :label="roleLabel[currentWord.role]"
                    />
                </div>
                <p :class="$style['warning']">
                    Ne montre pas ton mot aux autres !
                </p>
                <UButton
                    v-if="reviewingPlayer"
                    size="xl"
                    block
                    variant="outline"
                    @click="handleCloseReview"
                >
                    Fermer
                </UButton>
                <UButton
                    v-else
                    size="xl"
                    block
                    @click="handleWordSeen"
                >
                    J'ai mémorisé — passer au suivant
                </UButton>
            </div>
        </template>

        <!-- ═══ PLAYING (transition) ══════════════════════════════════════════ -->
        <template v-else-if="room?.status === 'playing'">
            <div :class="$style['screen']">
                <div :class="$style['card']">
                    <p :class="$style['ready-icon']">
                        🕵️
                    </p>
                    <h2 :class="$style['card-title']">
                        Tout le monde est prêt !
                    </h2>
                    <p :class="$style['hint']">
                        Chacun va donner un indice en un mot.<br>
                        Essayez de trouver l'undercover !
                    </p>
                </div>
                <UButton
                    size="xl"
                    block
                    @click="startDescribing"
                >
                    Commencer les indices
                </UButton>
            </div>
        </template>

        <!-- ═══ DESCRIBING ════════════════════════════════════════════════════ -->
        <template v-else-if="room?.status === 'describing'">
            <!-- Écran de verrouillage entre deux joueurs -->
            <div
                v-if="waitingForDescriber && pendingDescriptionPlayer"
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Manche {{ currentRound }} · {{ descriptionProgress }} indices
                    </p>
                    <p :class="$style['player-name']">
                        {{ pendingDescriptionPlayer.name }}
                    </p>
                    <p :class="$style['hint']">
                        Passe le téléphone à {{ pendingDescriptionPlayer.name }}
                    </p>
                </div>
                <UButton
                    size="xl"
                    block
                    @click="waitingForDescriber = false"
                >
                    C'est moi, je suis prêt(e)
                </UButton>
            </div>

            <!-- Saisie de l'indice -->
            <div
                v-else-if="pendingDescriptionPlayer && !showAllDescriptions"
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Manche {{ currentRound }} · {{ descriptionProgress }} indices
                    </p>
                    <p :class="$style['player-name']">
                        {{ pendingDescriptionPlayer.name }}
                    </p>
                    <p :class="$style['hint']">
                        Donne un indice en <strong>un seul mot</strong>
                    </p>
                    <UInput
                        v-model="descriptionInput"
                        placeholder="Ton indice..."
                        size="lg"
                        :maxlength="32"
                        autofocus
                        @keyup.enter="handleSubmitDescription"
                    />
                </div>
                <UButton
                    size="xl"
                    block
                    @click="handleSubmitDescription"
                >
                    Valider mon indice
                </UButton>
            </div>

            <!-- Récap de tous les indices → avant le vote -->
            <div
                v-else
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Manche {{ currentRound }} · Les indices
                    </p>
                    <ul :class="$style['desc-list']">
                        <li
                            v-for="desc in descriptions"
                            :key="desc.playerId"
                            :class="$style['desc-item']"
                        >
                            <span :class="$style['desc-name']">
                                {{ players.find(p => p.id === desc.playerId)?.name }}
                            </span>
                            <span :class="$style['desc-text']">{{ desc.text }}</span>
                        </li>
                    </ul>
                </div>
                <UButton
                    size="xl"
                    block
                    @click="startVoting()"
                >
                    Passer au vote
                </UButton>
            </div>
        </template>

        <!-- ═══ VOTING ════════════════════════════════════════════════════════ -->
        <template v-else-if="room?.status === 'voting'">
            <!-- Résultat d'élimination -->
            <div
                v-if="eliminationResult"
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Éliminé(e)
                    </p>
                    <p :class="$style['player-name']">
                        {{ eliminationResult.name }}
                    </p>
                    <UBadge
                        v-if="eliminationResult.role"
                        :color="roleColor[eliminationResult.role]"
                        variant="soft"
                        size="lg"
                        :label="roleLabel[eliminationResult.role]"
                    />
                    <p :class="$style['hint']">
                        {{ eliminationResult.role === 'undercover'
                            ? '✓ Bien joué, c\'était bien un undercover !'
                            : '✗ Raté, ce n\'était pas l\'undercover…' }}
                    </p>
                </div>
                <UButton
                    size="xl"
                    block
                    @click="handleContinueAfterElimination"
                >
                    Continuer
                </UButton>
            </div>

            <!-- Récap des votes avant révélation -->
            <div
                v-else-if="showVoteRecap"
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Résultat des votes
                    </p>
                    <ul :class="$style['vote-recap-list']">
                        <li
                            v-for="{ player, count } in voteResults"
                            :key="player.id"
                            :class="[$style['vote-recap-item'], count > 0 && $style['vote-recap-item--voted']]"
                        >
                            <span :class="$style['desc-name']">{{ player.name }}</span>
                            <span :class="$style['vote-count']">{{ count }} vote{{ count > 1 ? 's' : '' }}</span>
                        </li>
                    </ul>
                </div>
                <UButton
                    size="xl"
                    block
                    @click="handleRevealElimination"
                >
                    Révéler l'éliminé(e)
                </UButton>
            </div>

            <!-- Écran de verrouillage entre deux votants -->
            <div
                v-else-if="waitingForVoter && pendingVotePlayer"
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Vote · {{ voteProgress }} ont voté
                    </p>
                    <p :class="$style['player-name']">
                        {{ pendingVotePlayer.name }}
                    </p>
                    <p :class="$style['hint']">
                        Passe le téléphone à {{ pendingVotePlayer.name }}
                    </p>
                </div>
                <UButton
                    size="xl"
                    block
                    @click="waitingForVoter = false"
                >
                    C'est moi, je suis prêt(e)
                </UButton>
            </div>

            <!-- Saisie du vote -->
            <div
                v-else-if="pendingVotePlayer"
                :class="$style['screen']"
            >
                <div :class="$style['card']">
                    <p :class="$style['label']">
                        Vote de {{ pendingVotePlayer.name }}
                    </p>
                    <p :class="$style['hint']">
                        Qui veux-tu éliminer ?
                    </p>
                    <ul :class="$style['vote-list']">
                        <li
                            v-for="player in alivePlayers.filter(p => p.id !== pendingVotePlayer?.id)"
                            :key="player.id"
                            :class="[$style['vote-item'], selectedVoteTarget === player.id && $style['vote-item--selected']]"
                            @click="selectedVoteTarget = player.id"
                        >
                            {{ player.name }}
                        </li>
                    </ul>
                </div>
                <UButton
                    size="xl"
                    block
                    :disabled="!selectedVoteTarget"
                    @click="handleSubmitVote"
                >
                    Voter
                </UButton>
            </div>
        </template>

        <!-- ═══ RESULT ════════════════════════════════════════════════════════ -->
        <template v-else-if="room?.status === 'result'">
            <div :class="$style['screen']">
                <div :class="$style['card']">
                    <p :class="$style['ready-icon']">
                        {{ winner === 'civil' ? '🏆' : '🕵️' }}
                    </p>
                    <h2 :class="$style['card-title']">
                        {{ winner === 'civil' ? 'Les civils ont gagné !' : 'Les undercovers ont gagné !' }}
                    </h2>
                    <ul :class="$style['result-list']">
                        <li
                            v-for="player in players"
                            :key="player.id"
                            :class="[$style['result-item'], !player.isAlive && $style['result-item--eliminated']]"
                        >
                            <span :class="$style['result-name']">{{ player.name }}</span>
                            <UBadge
                                v-if="player.role"
                                :color="roleColor[player.role]"
                                variant="soft"
                                size="sm"
                                :label="roleLabel[player.role]"
                            />
                            <span
                                v-if="!player.isAlive"
                                :class="$style['eliminated-tag']"
                            >éliminé</span>
                        </li>
                    </ul>
                </div>
                <UButton
                    size="xl"
                    block
                    variant="outline"
                    to="/"
                    @click="reset()"
                >
                    Nouvelle partie
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

.screen {
    display: flex;
    width: 100%;
    max-width: 420px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
}

.card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 24px;
    border: 1px solid var(--ui-border);
    border-radius: 16px;
    background: var(--ui-bg-elevated);
    gap: 12px;
    text-align: center;
}

.label {
    color: var(--ui-text-muted);
    font-size: 0.8125rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.player-name {
    color: var(--ui-primary);
    font-size: 2rem;
    font-weight: 700;
}

.big-word {
    color: var(--ui-primary);
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.card-title {
    font-size: 1.25rem;
    font-weight: 700;
}

.hint {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
}

.warning {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    text-align: center;
}

.btn-back {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
}

.ready-icon {
    font-size: 3rem;
    line-height: 1;
}

// Descriptions
.desc-list {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0;
    margin: 0;
    gap: 8px;
    list-style: none;
    text-align: left;
}

.desc-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--ui-bg-accented);
    gap: 8px;
}

.desc-name {
    color: var(--ui-text-muted);
    font-size: 0.875rem;
    white-space: nowrap;
}

.desc-text {
    font-weight: 600;
}

// Vote list
.vote-list {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0;
    margin: 0;
    gap: 8px;
    list-style: none;
    text-align: left;
}

.vote-item {
    padding: 12px 16px;
    border: 2px solid transparent;
    border-radius: 10px;
    background: var(--ui-bg-accented);
    cursor: pointer;
    font-weight: 500;
    transition: border-color 0.15s, background 0.15s;

    &:hover {
        background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
    }
}

.vote-item--selected {
    border-color: var(--ui-primary);
    background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
    color: var(--ui-primary);
}

// Vote recap
.vote-recap-list {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0;
    margin: 0;
    gap: 8px;
    list-style: none;
    text-align: left;
}

.vote-recap-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--ui-bg-accented);
}

.vote-recap-item--voted {
    background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}

.vote-count {
    font-size: 0.875rem;
    font-weight: 600;
}

// Result
.result-list {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0;
    margin: 0;
    gap: 6px;
    list-style: none;
    text-align: left;
}

.result-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--ui-bg-accented);
    gap: 8px;
}

.result-item--eliminated {
    opacity: 0.5;
}

.result-name {
    flex: 1;
    font-weight: 500;
}

.eliminated-tag {
    color: var(--ui-text-muted);
    font-size: 0.75rem;
}
</style>
