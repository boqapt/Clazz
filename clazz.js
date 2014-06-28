//Inheritance utility class. Now supports just single inheritance
var Clazz = function() {
    function constructionMethods(extendFunc) {
        return {
            baseCallDirect: function(baseClass, args) {
                //create private scope of parent class and connect it to constructed object
                extendFunc(this, typeof(baseClass) !== 'function' ? baseClass : baseClass.apply(this, args));
                this.base = extendFunc({}, this); //create parent fields table and save link to it
            },

            //we need __baseClasses, baseCall, baseApply just to not be obliged specifying base class name in 2 places
            //(inherit call and constructor call). We can still call base constructor directly with baseCallDirect

            //Assumption: caller didn't modify 'thiz' (for example, setting fields) before call (needed for parent fields table)
            //Has variable number of arguments, all passed to base constructor
            baseCall: function() {
                var baseClassesBackup = this.__baseClasses;
                this.__baseClasses = this.__baseClasses.slice();
                //remove base class from __baseClasses. make it equal to own chain of inheritance of base class
                var baseClass = this.__baseClasses.pop();
                this.baseCallDirect(baseClass, arguments);
                this.__baseClasses = baseClassesBackup;
            },

            baseApply: function(args) {
                this.baseCall.apply(this, args);
            }
        }
    }
    return {
        //simple copying of fields from source to target. Returns source
        //Use it if no need for own properties check or other complex stuff, otherwise use things like jQuery.extend
        extend: function(source, target) {
            for (var k in target) {
                source[k] = target[k];
            }
            return source;
        },
        //base, clazz: constructors of classes, whether function or object.
        //(object is used if no need for private fields)
        //extendFunc - function for merging prototypes. optional. Used if simplest extend isn't enough
        //Assumption: if base and class are functions they return nothing (they use .extend function for defining fields)
        //Assumption: base constructor supports calling without parameters (prototype construction mode)
        inherit: function(base, clazz, extendFunc) {
            extendFunc = extendFunc || Clazz.extend;
            var constructor;
            if (typeof(clazz) !== 'function') {
                constructor = function() {
                    this.baseApply(arguments);
                };
                constructor.prototype = clazz;
            } else {
                constructor = clazz;
                constructor.prototype = {};
            }
            var baseProto = base;
            if (typeof(base) !== 'function') {
                baseProto = function() {};
                baseProto.prototype = base;
            }
            Clazz.extend(constructor.prototype, new baseProto());
            constructor.prototype.constructor = constructor;
            constructor.prototype.__baseClasses = constructor.prototype.__baseClasses || []; //chain of base classes
            constructor.prototype.__baseClasses.push(baseProto); // (for tracking currently constructed ancestor)
            Clazz.extend(constructor.prototype,  constructionMethods(extendFunc));
            return constructor;
        }
    }
}();

if (module) {
    module.exports = Clazz.Clazz = Clazz;
}