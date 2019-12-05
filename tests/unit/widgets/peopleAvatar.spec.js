import { mount, createLocalVue } from '@vue/test-utils'
import PeopleAvatar from '../../../src/components/widgets/PeopleAvatar'
import VueRouter from 'vue-router'

const localVue = createLocalVue()

localVue.use(VueRouter)

const router = new VueRouter()

describe('PeopleAvatar', () => {
  const wrapper = mount(PeopleAvatar, {
    propsData: {
      person: {
        id: '1',
        full_name: 'John Doe',
        has_avatar: false,
        color: 'rgb(204, 204, 204)',
        initials: 'JD'
      },
      size: 30,
      'font-size': 20,
      'is-link': false,
      'no-cache': true
    },
    localVue,
    router
  })

  describe('Mount', () => {
    it('should display initials', () => {
      const avatar = wrapper.findAll('.avatar')
      expect(avatar.at(0).text()).toMatch('JD')
    })

    it('should display rgb(204, 204, 204) as background-color', () => {
      expect(wrapper.element.style.background).toMatch('rgb(204, 204, 204)')
    })

    it('should display initials with a font-size of 20px', () => {
      expect(wrapper.element.style.fontSize).toMatch('20px')
    })

    it('should not have a link', () => {
      expect(wrapper.find('.avatar-link').exists()).toBe(false)
    })

    it('should use cache for images', () => {
      wrapper.setProps({
        person: {
          has_avatar: true,
          avatarPath: 'img.png',
          uniqueHash: '1337'
        }
      })
      expect(wrapper.element.children[0].src).toMatch(new RegExp(/img.png\?unique=1337$/))
      expect(wrapper.props('avatarKey')).toBeUndefined()
    })

    it('should display an avatar with a width & height of 30px', () => {
      expect(wrapper.element.style.width).toMatch('30px')
      expect(wrapper.element.style.height).toMatch('30px')
    })
  })
})
