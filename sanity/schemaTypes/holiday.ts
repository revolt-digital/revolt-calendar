import { defineField, defineType } from 'sanity'

export const holiday = defineType({
  name: 'holiday',
  title: 'Holiday',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name (Spanish)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'nameEn',
      title: 'Name (English)',
      type: 'string',
      description: 'English translation of the holiday name',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description (Spanish)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'descriptionEn',
      title: 'Description (English)',
      type: 'text',
      rows: 3,
      description: 'English translation of the description',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Aprobado', value: 'approved' },
          { title: 'Working', value: 'working' },
          { title: 'Custom', value: 'custom' },
        ],
      },
      initialValue: 'approved',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'startDate',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      const statusEmoji = {
        approved: '✅',
        working: '💼',
        custom: '🏢',
      }
      
      return {
        title: `${statusEmoji[status as keyof typeof statusEmoji] || '✅'} ${title}`,
        subtitle: subtitle,
      }
    },
  },
})
