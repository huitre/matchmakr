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
      console.log('http://192.99.12.85:3000/needs?skills=' + chip.name + '&embed');
      $http.get('http://192.99.12.85:3000/needs?skills=' + chip.name + '&embed').then(function(needs) {
        if (!needs.data.total)
          return deferred.reject(needs);
        self.needs = needs.data._embedded.needs;
        console.log(self.needs);
        /*
        var calls = needs.data._links.proposals.map(function(link) {
          console.log(link);
          return $http.get(link.href);
        });
        $q.all(calls).then(function(results) {
          console.log(results);
          deferred.resolve(results);
        },
        function(errors) {
        deferred.reject(errors);
        },
        function(updates) {
          deferred.update(updates);
        });
        */
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
