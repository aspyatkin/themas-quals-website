import $ from 'jquery'

class DataStore {
  constructor () {
    this.eventSource = null
  }

  verifyEmail (data, token, callback) {
    return $.ajax({
      url: '/api/team/verify-email',
      type: 'POST',
      dataType: 'json',
      data: data,
      headers: {
        'X-CSRF-Token': token
      },
      success: (responseJSON, textStatus, jqXHR) => {
        callback(null, responseJSON)
      },
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseJSON) {
          callback(jqXHR.responseJSON, null)
        } else {
          callback('Unknown error. Please try again later.', null)
        }
      }
    })
  }

  supportsRealtime () {
    return !!window.EventSource
  }

  connectedRealtime () {
    return (this.supportsRealtime() && this.eventSource && this.eventSource.readyState !== 2)
  }

  connectRealtime () {
    this.eventSource = new window.EventSource('/api/events')
  }

  disconnectRealtime () {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  getRealtimeProvider () {
    return this.eventSource
  }
}

export default new DataStore()
