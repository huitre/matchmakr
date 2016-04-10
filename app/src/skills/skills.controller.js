angular.module('MatchMakr').controller('SkillsController',
  ['$scope', '$rootScope', '$q', '$timeout', '$http',
  function SkillsController ($scope, $rootScope, $q, $timeout, $http) {
    var self = this;
    var pendingSearch, cancelSearch = angular.noop;
    var cachedQuery, lastSearch;

    self.readonly = false;
    self.selectedItem = null;
    self.searchText = null;
    self.selectedSkills = [];
    self.skills = loadSkills();
    self.needs = [];
    self.querySearch = querySearch;
    self.transformChip = transformChip;
    self.searchNeeds = searchNeeds;
    self.isLoading = false;
    self.matchedProfiles = [];
    self.needsProfiles = [];
    /**
     * Search for contacts; use a random delay to simulate a remote call
     */
    function asyncQuerySearch(criteria) {
      return pendingSearch = $q(function(resolve, reject) {
        $http.get('http://192.99.12.85:3000/index/skills/' + criteria).then(function(skills) {
          resolve(transformChip(skills.data._links.keys));
        });
      });
    }

    function querySearch(criteria) {
      var match = [];
      self.skills.map(function(skill) {
        if (skill.name.indexOf(criteria) === 0) {
          match.push(skill);
        }
      });
      return match;
    }

    function searchNeeds(chip) {
      var deferred = $q.defer();
      self.isLoading = true;
      $http.get('http://192.99.12.85:3000/needs?skills=' + chip.name + '&embed&type=proposals').then(function(results) {
        var data = results.data._links;

        var proposals = data.proposals && data.proposals.map(function(link) {
          return $http.get(link.href).then(function(results) {
            return profileData = results.data

          });
        });
        $q.all(proposals).then(function(results) {
          debugger;
          console.log(results)
          self.isLoading = false;
          self.needsProfiles = results.data;
          deferred.resolve(results);
        },
        function(errors) {
        deferred.reject(errors);
        },
        function(updates) {
          deferred.update(updates);
        });
      });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(vegetable) {
        return (vegetable._lowername.indexOf(lowercaseQuery) === 0) ||
            (vegetable._lowertype.indexOf(lowercaseQuery) === 0);
      };

    }
    /**
     * Transform a skills to a chip
     */
    function transformChip(chips) {
      if (Array.isArray(chips)) {
        return (
          chips.map(function (chip) {
            return {
              name: chip.title || '+(' + chip.key + ')',
              type: chip.rel
            }
          })
        );
      }
      return chips;
    }

    function loadSkills() {
      $http.get('http://192.99.12.85:3000/skills').then(function(skills) {
        self.skills = transformChip(skills.data._links.skills)
      });
    }
  }]);
