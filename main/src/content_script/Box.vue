<template>
    <div id="oss-watch" :class="themeClass" v-if="adapterName">
        <transition leave-active-class="ow-animated flipOutY"
            enter-active-class="ow-animated flipInY"
            mode="out-in"
            appear>
            <button class="ow-btn ow-btn-entry"
                @click="start"
                :disabled="!isInited"
                v-if="!isStarted">
                补货提醒
            </button>

            <div class="ow-main" v-else>
                <h5 class="ow-title">补货监控</h5>
                <hr class="ow-hr">

                <div class="ow-task-box">
                    <transition-group name="fade" class="ow-task-list" tag="ul">
                        <li class="ow-task" v-for="(t, i) of tasks" :key="t.id">
                            <div class="ow-task-title">
                                <span class="ow-t-name">{{ t.text }}</span>
                                <transition name="fade">
                                    <span class="ow-stock" v-show="t.stock > -1">{{ t.stock }}</span>
                                </transition>
                            </div>
                            <i class="material-icons ow-i-remove"
                                @click="onClickRemove(i)">clear</i>
                        </li>
                    </transition-group>

                    <button class="ow-btn ow-btn-newtask"
                        @click="onClickShowCreate"
                        v-show="!isShowCreating">
                        <i class="material-icons">add</i>
                        新建任务
                    </button>
                </div>

                <transition name="fadeRightIn">
                    <div class="ow-create-box" v-show="isShowCreating">
                        <h6 class="ow-title ow-title-create">
                            新建任务
                            <i class="material-icons ow-close" @click="onClickClose">delete_forever</i>
                        </h6>

                        <div class="ow-create-task">
                            <div class="ow-type-box" v-show="!!types.length">
                                <div class="ow-title ow-title-plain">{{ text.typeText }}</div>
                                <transition-group name="scale" class="ow-type-list" tag="ul">
                                    <li class="ow-type"
                                        v-for="(t, i) of types"
                                        :class="{ 'ow-active': currentType && currentType.id === t.id, 'ow-img-text': !t.img }"
                                        @click="onSelectType(t)"
                                        :key="i">
                                        <div class="ow-img-box">
                                            <img :src="t.img" :title="t.title" class="ow-img" v-if="t.img">
                                            <span v-else>{{ t.title }}</span>
                                        </div>
                                    </li>
                                </transition-group>
                            </div>

                            <transition name="fadeUpIn">
                                <div class="ow-size-box" v-show="!!sizes">
                                    <div class="ow-title ow-title-plain">{{ text.sizeText }}</div>
                                    <ul class="ow-size-list">
                                        <li class="ow-size"
                                            v-for="(s, i) of sizes"
                                            :class="{ 'ow-active': currentSize && currentSize.sizeId === s.sizeId }"
                                            @click="onSelectSize(s)"
                                            :key="s.sizeId">
                                            {{ s.sizeName }}
                                        </li>
                                    </ul>
                                </div>
                            </transition>

                            <transition name="fadeDownIn">
                                <div class="ow-btn-box ow-btn-create-box" v-show="hasSelectedSize">
                                    <button class="ow-btn ow-btn-block ow-btn-emp"
                                        :class="isDuplicatedTask ? 'ow-animated shake' : ''"
                                        @click="onClickCreate"
                                        :disabled="!currentSize || isDuplicatedTask">
                                        创建
                                    </button>

                                    <p class="ow-msg" v-show="isDuplicatedTask">任务重复了哦~</p>
                                </div>
                            </transition>

                        </div>

                    </div>
                </transition>
            </div>
        </transition>
    </div>
</template>

<script>
import * as Adapters from './adapters'
import eventBus from './event-bus'
import { reqPermission } from './utils'

export default {
    name: 'Box',

    data() {
        return {
            // states
            adapterName: '',
            isInited: false,
            isStarted: false,
            isShowCreating: false,
            hasSelectedSize: false,
            isDuplicatedTask: false,

            tasks: [],
            currentType: null,
            currentSize: null,

            // data
            text: {
                sizeText: '',
                typeText: '',
            },
            types: [],
        }
    },

    computed: {
        themeClass() {
            return 'theme-' + this.adapterName
        },

        sizes() {
            if (!this.currentType || !this.currentType.sizes) return null
            return this.currentType.sizes
        },
    },

    watch: {
        isInited(n, o) {
            if (n) {
                reqPermission()
            }
        }
    },

    methods: {
        start() {
            this.isStarted = true
        },

        async init(adapterName) {
            const adapter = Adapters.loadAdapter(adapterName)
            if (!adapter) return

            const rawData = await adapter.scrapeRawData()
            const data = adapter.parseRawData(rawData)
            this.text = data.text
            this.types = data.types

            this.monitor = adapter.newMonitor()
            this.monitor.on('update', (sku, stock) => {
                console.log(sku, stock)
                this.$set(this.tasks.filter(t => t.skuId === sku.skuId)[0], 'stock', stock)
            })

            adapter.adapt(rawData)

            this.isInited = true
        },

        onClickRemove(taskIndex) {
            const t = this.tasks[taskIndex]
            this.monitor.removeSku(t.skuId)
            this.tasks.splice(taskIndex, 1)
        },

        onClickShowCreate() {
            this.isShowCreating = true
        },

        onSelectType(t) {
            this.currentType = t
            this.currentSize = null
        },

        onSelectSize(s) {
            this.currentSize = s
            this.hasSelectedSize = true
        },

        onClickClose() {
            this.currentType = null
            this.currentSize = null
            this.isShowCreating = false
            this.hasSelectedSize = false
        },

        onClickCreate() {
            const size = this.currentSize

            const task = {
                id: size.id,
                text: size.name,
                skuId: size.skuId
            }

            if (this.tasks.filter(t => t.id === task.id).length) {
                this.isDuplicatedTask = true
                setTimeout(() => {
                    this.isDuplicatedTask = false
                }, 1500)
            } else {
                this.monitor.addSku(task.id, task.skuId, task.text)
                this.tasks.push(task)
                this.onClickClose()
            }
        },
    },

    created() {
        eventBus.on('inject-adapterName', (name) => {
            this.adapterName = name
            this.init(name)
        })
    },
}
</script>

<style lang="stylus" src="./style.styl"></style>
