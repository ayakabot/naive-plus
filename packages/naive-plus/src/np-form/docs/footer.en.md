---
permalink: /en/form/footer/
lang: en-US
---

# np-form Custom Footer

Customize the footer through the `footer` prop.

<demo src="../__demos__/footer.en.vue"></demo>

## Align Right

Set `align="right"` to align the footer content to the end. The validation feedback is aligned to the end as well.

<demo src="../__demos__/footer-align.en.vue"></demo>

## Component Configuration

### FormOption Props

| Prop | Description | Type | Default |
| ---- | ---- | ---- | ---- |
| footer | Footer config; set to `false` to hide the whole footer | boolean / [FooterProps](#footer-props) | - |

### Footer Props

| Prop | Description | Type | Default |
| ---- | ---- | ---- | ---- |
| submitBtn | Whether to show the submit button | boolean | true |
| resetBtn | Whether to show the reset button | boolean | true |
| submitErrorFeedback | Whether to show the submit (`onSubmit`) error message as the feedback of the footer form item | boolean | true |
| align | Footer content alignment; `right` aligns to the end and moves the validation feedback to the end as well | `'left' \| 'right'` | `'left'` |
| prefixRender | Prefix render function | `(data)=>VNode` | - |
| suffixRender | Suffix render function | `(data)=>VNode` | - |

## Global Defaults

`formItemProps` / `style` / `align` / `submitErrorFeedback` / `submitBtn` / `resetBtn` can be set globally through [NpConfigProvider](/en/components/np-config-provider/). The same config in `option.footer` takes priority, and `option.footer: false` still hides the whole footer.

```vue
<np-config-provider
  :component-options="{
    Form: {
      footer: {
        align: 'right',
        submitBtn: { text: 'Save' },
      },
    },
  }"
>
  <np-form :option="option" />
</np-config-provider>
```

`prefixRender` / `suffixRender` are content render functions, specify them at the usage site.

Button text priority: `submitBtn.text` / `resetBtn.text` > `componentOptions.Form.footer` of `NpConfigProvider` > the [locale](/en/components/np-config-provider/#locale) messages. Prefer `locale` when you need i18n.
