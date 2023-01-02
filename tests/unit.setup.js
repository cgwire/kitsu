import { config } from "@vue/test-utils"
import moment from 'moment'

moment.locale('en')
config.mocks = {
  $t: tKey => tKey // just return translation key
};
