import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import moment from 'moment'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import URLSearchParams from 'url-search-params'
import countryProvider from '../providers/country'

class ScoreboardView extends View {
  constructor () {
    super()
    this.$main = null

    this.onUpdateTeamScore = null
    this.onUpdateTeamLogo = null
    this.onUpdateTeamProfile = null

    this.onReloadScoreboard = null
    this.reloadScoreboard = false
    this.reloadScoreboardInterval = null
    this.renderingScoreboard = false

    this.detailed = false
  }

  renderScoreboard () {
    this.$main.find('section').html(window.themis.quals.templates.scoreboardTable({
      _: _,
      moment: moment,
      detailed: this.detailed,
      templates: window.themis.quals.templates,
      teams: teamProvider.getTeams(),
      teamScores: contestProvider.getTeamScores(),
      countries: countryProvider.getCountries(),
      identity: identityProvider.getIdentity()
    }))
  }

  present () {
    this.$main = $('#main')

    $
      .when(
        identityProvider.initIdentity(),
        contestProvider.initContest(),
        teamProvider.initTeams(),
        contestProvider.initTeamScores(),
        countryProvider.initCountries()
      )
      .done((identity, contest, teams, teamScores, countries) => {
        identityProvider.subscribe()

        let urlParams = new URLSearchParams(window.location.search)
        this.detailed = urlParams.has('detailed')

        teamProvider.subscribe()

        newNavigationBar.present()
        newStatusBar.present()

        this.onUpdateTeamScore = (teamScore) => {
          this.reloadScoreboard = true
          return false
        }

        contestProvider.on('updateTeamScore', this.onUpdateTeamScore)

        this.onUpdateTeamLogo = (team) => {
          const teamId = team.id
          setTimeout(() => {
            let el = document.getElementById(`team-${teamId}-logo`)
            if (el) {
              el.setAttribute('src', `/api/team/${teamId}/logo?timestamp=${(new Date()).getTime()}`)
            }
          }, 500)
          return false
        }

        teamProvider.on('updateTeamLogo', this.onUpdateTeamLogo)

        this.onUpdateTeamProfile = () => {
          this.reloadScoreboard = true
          return false
        }

        teamProvider.on('updateTeamProfile', this.onUpdateTeamProfile)

        this.onReloadScoreboard = () => {
          if (!this.reloadScoreboard || this.renderingScoreboard) {
            return
          }

          this.renderingScoreboard = true
          this.renderScoreboard()
          this.reloadScoreboard = false
          this.renderingScoreboard = false
        }

        this.reloadScoreboardInterval = setInterval(this.onReloadScoreboard, 1500)
      })
  }
}

export default new ScoreboardView()
