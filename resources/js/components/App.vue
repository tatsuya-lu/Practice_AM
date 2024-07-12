<template>
    <div>
        <Header />
        <main>
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
    components: {
        Header
    }
}
</script>