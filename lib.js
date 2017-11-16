'use strict';
/* eslint no-loop-func:  */

function sortByNames(friend1, friend2) {
    if (friend1.name < friend2.name) {
        return -1;
    }
    if (friend1.name > friend2.name) {
        return 1;
    }

    return 0;
}

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    check(filter, friend) {
        return filter(friend);
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    check(friend) {
        return friend.gender === 'male';
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    check(friend) {
        return friend.gender === 'female';
    }
}

class Iterator {

    /**
     * Итератор по друзьям
     * @constructor
     * @param {Object[]} friends
     * @param {Filter} filter
     */
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError();
        }
        this.friendList = friends.sort(sortByNames);
        this.filter = filter;
        this.unchecked = friends.filter(friend => !friend.best);
        this.inviteList = this.getInviteList();
    }
    isChecked(friend) {
        return this.unchecked.indexOf(friend) === -1;
    }
    check(friend) {
        this.unchecked.splice(this.unchecked.indexOf(friend), 1);
    }
    findFriend(name) {
        return this.friendList.find(friend => friend.name === name);
    }
    getInviteList() {
        let toInvite = this.friendList.filter(friend => friend.best);
        let i = 0;
        while (toInvite[i]) {
            toInvite[i].friends.sort().forEach(function (name) {
                let friend = this.findFriend(name);
                let checked = this.isChecked(friend);
                if (!checked) {
                    this.check(friend);
                    toInvite.push(friend);
                }
            }.bind(this));
            i++;
        }

        return toInvite.filter(this.filter.check);
    }
    done() {
        return !this.inviteList.length;
    }
    next() {
        return this.inviteList.length ? this.inviteList.shift() : null;
    }
}

class LimitedIterator extends Iterator {

    /**
     * Итератор по друзям с ограничением по кругу
     * @extends Iterator
     * @constructor
     * @param {Object[]} friends
     * @param {Filter} filter
     * @param {Number} maxLevel – максимальный круг друзей
     */
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        this.unchecked = [...friends];
        this.inviteList = this.getInviteList(maxLevel);
    }

    getInviteList(maxLevel) {
        let nextWave = [];
        let currentWave = this.friendList.filter(friend => friend.best);
        let toInvite = [...currentWave];
        let i = 0;
        while (i < maxLevel - 1) {
            currentWave.forEach(person => person.friends.sort().forEach(function (name) {
                let friend = this.findFriend(name);
                let checked = this.isChecked(friend);
                if (!checked) {
                    this.check(friend);
                    nextWave.push(friend);
                }
            }.bind(this)));
            toInvite.push(...nextWave);
            currentWave = [...nextWave];
            nextWave = [];
            i++;
        }

        return toInvite.filter(this.filter.check);
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
