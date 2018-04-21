<template>
    <div id="oss-watch" :class="themeClass">
        <transition leave-active-class="animated flipOutY"
            enter-active-class="animated flipInY"
            mode="out-in"
            appear>
            <button class="ow-btn ow-btn-entry"
                @click="start"
                v-if="!isStarted">
                补货通知
            </button>

            <div class="ow-main" v-else="isStarted">
                <h5 class="ow-title">补货监控</h5>
                <hr class="ow-hr">

                <div class="ow-task-box">
                    <transition-group name="fade" class="ow-task-list" tag="ul">
                        <li class="ow-task" v-for="(t, i) of tasks" :key="t.id">
                            {{ t.text }}
                            <i class="material-icons ow-i-remove"
                                @click="onClickRemove(i)">clear</i>
                        </li>
                    </transition-group>

                    <button class="ow-btn ow-btn-newtask"
                        @click="isShowCreating = true"
                        v-show="!isShowCreating">
                        <i class="material-icons">add</i>
                        新建任务
                    </button>
                </div>

                <transition name="fadeLeftIn">
                    <div class="ow-create-box" v-show="isShowCreating">
                        <h6 class="ow-title ow-title-create">
                            新建任务
                            <i class="material-icons ow-close" @click="onClickClose">delete_forever</i>
                        </h6>

                        <div class="ow-create-task">
                            <div class="ow-title">款式</div>

                            <ul class="ow-type-list">
                                <li class="ow-type"
                                    v-for="(t, i) of types"
                                    :class="{ 'ow-active': currentType && currentType.id === t.id }"
                                    @click="onSelectType(t)"
                                    :key="i">
                                    <div class="ow-img-box">
                                        <img :src="t.img" :title="t.title" class="ow-img">
                                    </div>
                                </li>
                            </ul>

                            <transition name="fadeUpIn">
                                <div class="ow-size-box" v-show="!!sizes">
                                    <div class="ow-title">尺码</div>
                                    <ul class="ow-size-list">
                                        <li class="ow-size"
                                            v-for="(s, i) of sizes"
                                            :class="{ 'ow-active': currentSize && currentSize.id === s.id }"
                                            @click="onSelectSize(s)"
                                            :key="s.id">
                                            {{ s.name }}
                                        </li>
                                    </ul>
                                </div>
                            </transition>

                            <transition name="fadeDownIn">
                                <div class="ow-btn-box ow-btn-create-box" v-show="hasSelectedSize">
                                    <button class="ow-btn ow-btn-block ow-btn-emp"
                                        :class="isDuplicatedTask ? 'animated shake' : ''"
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
import * as mock from './mock'
import * as emitter from './emitter'

export default {
    name: 'Box',

    data() {
        return {
            // states
            themeName: 'tb',
            isStarted: true,
            isShowCreating: false,
            hasSelectedSize: false,
            isDuplicatedTask: false,

            // data
            types: mock.types,
            tasks: [],
            currentType: null,
            currentSize: null,
        }
    },

    computed: {
        themeClass() {
            return 'theme-' + this.themeName
        },

        sizes() {
            return this.currentType ? this.currentType.sizes : null
        },
    },

    methods: {
        start() {
            this.isStarted = true
        },

        onClickRemove(taskIndex) {
            this.tasks.splice(taskIndex, 1)
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
            const type = this.currentType
            const size = this.currentSize

            const task = {
                id: `${type.id}_${size.id}`,
                text: `${type.title} - ${size.name}`
            }

            if (this.tasks.filter(t => t.id === task.id).length) {
                console.log('dddddd')
                this.isDuplicatedTask = true
                setTimeout(() => {
                    this.isDuplicatedTask = false
                }, 1500)
            } else {
                this.tasks.push(task)
                this.onClickClose()
            }
        },
    },

    created() {
        emitter.on('inject-themeName', (name) => {
            this.themeName = name
        })
    }
}
</script>

<style lang="stylus" src="./style.styl"></style>
