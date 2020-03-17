import dayjs from 'dayjs';
export default function () {
  return {
    methods: {
      handleFocus () {
        typeof this.focus === 'function' && this.focus()
      },
      handleBlur () {
        typeof this.blur === 'function' && this.blur()
      },
      getLabelText (item) {
        if (this.validatenull(item)) return ''
        if (typeof this.typeformat === 'function') {
          return this.typeformat(item, this.labelKey, this.valueKey);
        }
        return item[this.labelKey]
      },
      handleClick () {
        const result =
          this.isString && this.multiple ? this.text.join(',') : this.text;
        if (typeof this.click === 'function') {
          this.click({ value: result, column: this.column });
        }
      },
      handleChange (value) {
        let result = value;
        if (this.$AVUE.ui.name == 'antd') {
          if (['date', 'time'].includes(this.type)) {
            const format = this.format.replace('dd', 'DD').replace('yyyy', 'YYYY');
            result = dayjs(value._d).format(format);
          } else if (['radio'].includes(this.type)) {
            result = value.target.value;
          }
        }
        this.text = result;
        if ((this.isString || this.isNumber) && (this.multiple || ['checkbox', 'cascader', 'ntree', 'dynamic'].includes(this.type))) {
          result = value.join(',')
        }
        if (typeof this.change === 'function') {
          this.change({ value: result, column: this.column });
        }
        //单选级联，只去最后节点值
      //   if ((!this.multiple && ['cascader'].includes(this.type)) && (value instanceof Array === true)) {
      //     result = value[value.length - 1]
      //     result = [].concat(value[value.length - 1]);
      //     console.log(result )
      //   }
        this.$emit('input', result);
        this.$emit('change', result);
      }
    }
  };
}
