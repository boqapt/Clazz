//Inheritance utility class. Now supports just single inheritance
var Clazz = function () {
    function constructionMethods(extendFunc) {
        return {
            //we need __baseClasses, superConstruct, superConstructApply just to not be obliged specifying base class
            // name in 2 places (inherit call and constructor call). We can still call base constructor directly with
            // superConstructDirect
            superConstructDirect:function (baseClass, args) {
                //create private scope of parent class and connect it to constructed object
                extendFunc(this, baseClass.apply(this, args));
                this.superclass = extendFunc({}, this); //create parent fields table and save link to it
            },

            //Assumption: caller didn't modify 'thiz' (for example, setting fields) before call (needed for parent fields table)
            //Has variable number of arguments, all passed to base constructor
            superConstruct:function () {
                if (this.__baseClasses.length) {
                    //remove base class from __baseClasses. make it equal to own chain of inheritance of base class
                    var baseClass = this.__baseClasses.pop();
                    this.superConstructDirect(baseClass, arguments);
                    this.__baseClasses.push(baseClass); //rollback __baseClasses
                }
            },

            superConstructApply:function (args) {
                this.superConstruct.apply(this, args);
            }
        }
    }

    function inherit(base, options, clazz) {
        var extendFunc = options.extendFunc || Clazz.extend;

        var constructor;
        var baseIsLiteral = typeof(base) !== 'function';
        if (typeof(clazz) !== 'function') {
            if (baseIsLiteral) {
                clazz = extendFunc(clazz, base);
                clazz.superclass = base;
                return clazz;
            }
            constructor = function () {
                this.superConstructApply(arguments);
                extendFunc(this, clazz);
            };
        } else {
            if (options.autoConstruct) {
                constructor = function () {
                    this.superConstructApply(arguments);
                    clazz.apply(this, arguments);
                };
            } else {
                constructor = clazz;
            }
            constructor.prototype = clazz.prototype;
        }

        var baseProto;
        var baseClasses; //chain of base classes (for tracking currently constructed ancestor)
        if (baseIsLiteral) {
            baseClasses = [];
            baseProto = base;
        } else {
            baseClasses = base.prototype.__baseClasses || [];
            baseClasses.push(base);
            baseProto = base.prototype;
        }
        baseProto = extendFunc({}, baseProto);
        if (baseIsLiteral) constructor.prototype.superclass = baseProto;
        constructor.prototype = extendFunc(baseProto, constructor.prototype);
        constructor.prototype.__baseClasses = baseClasses;
        constructor.prototype.constructor = constructor;
        Clazz.extend(constructor.prototype, constructionMethods(extendFunc));

        return constructor;
    }

    return {
        //simple copying of fields from source to target. Returns target
        //Use it if no need for own properties check or other complex stuff, otherwise use things like jQuery.extend
        extend:function (target, source) {
            for (var k in source) {
                target[k] = source[k];
            }
            return target;
        },
        //creates and returns class having functionality of 'clazz' but inheriting from 'base'.
        //
        //base (input parameter), clazz (input/output parameter): classes, whether function or literal object.
        //
        //Prototype of clazz is modified (for inheriting) but only if clazz is a function and options.autoConstruct is
        //not specified.
        //
        //- If one of base and clazz is function then returned class is function used for creation of
        // objects by 'new' operator.
        // Created objects have:
        // -- field .superclass containing virtual table of fields for ancestor
        // -- method superConstruct(arg1, arg2, ...) - call base constructor with given arguments
        // -- method superConstructApply(args) - same as superConstruct, bug arguments are given as array
        // -- method superConstructDirect(base, args) - call given base constructor with given array of arguments
        //
        //- If both base and clazz are literal objects result is literal object too (modified clazz object)
        // with superclass field equal to base
        //
        //options - optional object, can be omitted. Fields:
        //
        //- extendFunc - Used for merging objects. Specified if simple Clazz.extend isn't enough
        //
        //- autoConstruct - If specified, constructor of base class is called automatically on creation of object.
        //
        //Assumption: if not autoConstruct then constructor of clazz should call constructor of 'base' explicitly
        //(if both constructors exist)
        inherit:function (base, options, clazz) {
            if (arguments.length != 3) {
                clazz = arguments[1];
                options = {};
            }
            return inherit(base, options || {}, clazz);
        },
        //creates and returns class same as 'clazz' but inheriting from 'base'. constructor of base class is called
        //automatically on creation of object.
        //(Shortcut for .inherit with autoConstruct option.)
        inheritConstruct:function (base, options, clazz) {
            if (arguments.length != 3) {
                clazz = arguments[1];
                options = {};
            }
            options.autoConstruct = true;
            return inherit(base, options, clazz);
        }
    }
}();

if (typeof module !== 'undefined') {
    module.exports = Clazz.Clazz = Clazz;
}
