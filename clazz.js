//Inheritance utility class. Now supports just single inheritance
var Clazz = function () {
    function proxy(f, context) {
        return function () {
            f.apply(context, arguments);
        }
    }

    //creates virtual methods table
    function vtable(source, context) {
        var result = {};
        for (var key in source) {
            var f = source[key];
            if (typeof(f) === 'function') {
                result[key] = proxy(f, context);
            }
        }
        return result;
    }

    function superConstruct(extendFunc) {
        return function () {
            if (this.__baseClasses) {
                //remove base class from __baseClasses. make it equal to own chain of inheritance of base class
                var baseClass = this.__baseClasses.pop();
                //create private scope of parent class and connect it to constructed object
                var baseObject;
                if (typeof(baseClass) === 'function') {
                    extendFunc(this, baseClass.apply(this, arguments));
                    baseObject = this;
                } else {
                    baseObject = baseClass;
                }
                if (extendFunc !== Clazz.extend) {
                    baseObject = extendFunc({}, baseObject);
                }
                //create parent fields table and save link to it
                this.superclass = vtable(baseObject, this); //create parent fields table and save link to it
                this.__baseClasses.push(baseClass); //rollback __baseClasses
            }
        }
    }

    function autoConstructor(clazz, extendFunc) {
        return function () {
            this.superclass.apply(this, arguments);
            if (extendFunc) {
                extendFunc(this, clazz);
            } else {
                clazz.apply(this, arguments);
            }
        }
    }

    function inherit(base, options, clazz) {
        var extendFunc = options.extendFunc || Clazz.extend;
        //prepare class constructor
        var constructor;
        var baseIsLiteralObj = typeof(base) !== 'function';
        if (typeof(clazz) !== 'function') {
            if (baseIsLiteralObj) {
                clazz = extendFunc(clazz, base);
                clazz.superclass = base;
                return clazz;
            }
            constructor = autoConstructor(clazz, extendFunc);
        } else {
            constructor = options.autoConstruct ? autoConstructor(clazz) : clazz;
            constructor.prototype = clazz.prototype;
        }

        //prepare chain of inheritance and parent's prototype
        var baseProto = extendFunc({}, baseIsLiteralObj ? base : base.prototype);
        //chain of base classes (for tracking currently constructed ancestor)
        var baseClasses = baseIsLiteralObj ? [] : base.prototype.__baseClasses || [];
        baseClasses.push(base);

        //we need internal field __baseClasses just to not be obliged specifying base class name in 2 places (inherit
        // call and constructor call).
        constructor.prototype = Clazz.extend(extendFunc(baseProto, constructor.prototype), {
            __baseClasses: baseClasses,
            constructor: constructor,
            superclass: superConstruct(extendFunc)
        });

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
        // Created objects have method .superclass. It should be called to instantiate ancestor class.
        // Assumption (needed for correct work of constructor): caller don't modify properties of 'this' .superclass call
        // .superclass has variable number of arguments, all passed to ancestor's constructor
        // After this call method .superclass turns into field .superclass of object type
        // containing ancestor's methods (all own and inherited methods of ancestor). It's syntax like in Java language.
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