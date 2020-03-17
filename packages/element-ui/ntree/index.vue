<template>
<div>
  
  <treeselect 
          v-model="text"
          v-if="multiple"
          :multiple="true" 
          :options="dic" 
          :limit="limit"
          :clearable="clearable"
          :placeholder="placeholder"
          :disable-branch-nodes="branchNode"
          :show-count="showCount"
          :flatten-search-results="true"
          :value-consists-of="valueConsistsOf"
          @input="handleChange"
  />
  <treeselect 
          v-else
          v-model="tet"
          :options="dic" 
          :limit="limit"
          :clearable="clearable"
          :placeholder="placeholder"
          :disable-branch-nodes="branchNode"
          :show-count="showCount"
          :flatten-search-results="true"
          :value-consists-of="valueConsistsOf"
          @input="handleChange"
  />
</div>
</template>

<script>
import create from "core/create";
import props from "../../core/common/props.js";
import event from "../../core/common/event.js";
import Treeselect from '@riophae/vue-treeselect'
export default create({
  name: "ntree",
  mixins: [props(), event()],
  components: { Treeselect },
  props: {
    value: {},
    limit: {
      type: Number,
      default: Infinity
    },
    branchNode: {
      type: Boolean,
      default: false
    },
    showCount: {
      type: Boolean,
      default: false
    },
    valueConsistsOf: {
      type: String,
      default: 'BRANCH_PRIORITY'
    }
  },
  data () {
    return {
      text: '',
      tet: null,
    };
  },
  watch: {
    value(a,b) {
      if(b!== '') {
        this.$emit('input', a);
        this.$emit('change', a);
      }
    }
  },
  computed: {
  },
  created () {
  },
  mounted () { },
  methods: {
    handleChange(value, instanceId) {
      if(!value) value = null
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
});
</script>
