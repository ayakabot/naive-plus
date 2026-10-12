---
permalink: /en/form/submit-error/
lang: en-US
---

# np-form Submit Error Feedback

When submit (`onSubmit`) throws an error, the message is shown on the footer form item by default; set `footer.submitErrorFeedback: false` to disable it.

<demo src="../__demos__/submit-error.en.vue"></demo>

## Component Configuration

### Footer Props

| Prop | Description | Type | Default |
| ---- | ---- | ---- | ---- |
| submitErrorFeedback | Whether to show the submit (`onSubmit`) error message as the feedback of the footer form item | boolean | true |
