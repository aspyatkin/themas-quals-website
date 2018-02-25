import $ from 'jquery'
import View from '../base'
import renderTemplate from '../../utils/render-template'
import newNavigationBar from '../../new-navigation-bar'
import stateController from '../../controllers/state'
import metadataStore from '../../utils/metadata-store'
import identityProvider from '../../providers/identity'
import 'parsley'
import 'jquery-form'

class SupervisorSigninView extends View {
  constructor () {
    super(/^\/supervisor\/signin$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Login`
  }

  initLoginForm () {
    let $form = this.$main.find('form.themis-form-login')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function(ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function(ParsleyField) {
        return ParsleyField.$element.parents('form-group');
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    let $submitError = $form.find('.submit-error > p')
    let $submitButton = $form.find('button')

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          stateController.navigateTo('/')
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  present () {
    this.$main = $('#main')

    $
      .when(identityProvider.initIdentity())
      .done((identity) => {
        identityProvider.subscribe()
        newNavigationBar.present()
        if (identity.isGuest()) {
          this.initLoginForm()
        }
      })
  }

  dismiss () {
    identityProvider.unsubscribe()
    this.$main.empty()
    this.$main = null
    newNavigationBar.dismiss()
  }
}

export default new SupervisorSigninView()