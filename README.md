Clazz
=====

This lightweight OOP library provides some simple OOP features:
- inherit from prototype of parent class. Single inheritance s available, multiple not supported.
- preserve private fields and methods of parent classes and access to them with this inheritance
- use of fast prototype inheritance when it's possible
- use of functional inheritance when prototype inheritance is not enough (to preserve parent's private members).

Some other OOP libraries tend to implement all OOP features, like protected fields and interfaces. For that they use complex syntax, for example, a separate scope for variables with specific visibility or defining names of classes or fields inside strings. It complicates IDE syntax highlighting and debugging.
But this library has a goal to include features natural for JS only, use syntax and keywords of JS intended for OOP at maximum and have small footprint (see [example 1](#example-1-definition-of-class))


API
---

    Clazz.inherit(base, clazz, extendFunc)

creates and returns class having functionality of 'clazz' but inheriting from 'base'.

base (input parameter), clazz (input/output parameter): classes, whether function or literal object.

Prototype of clazz is modified (for inheriting) but only if clazz is a function and options.autoConstruct is
not specified.

- If one of base and clazz is function then returned class is function used for creation of
objects by 'new' operator. 
- If one of base and clazz is function then returned class is function used for creation of
objects by 'new' operator. 
Created objects have: 
  - field .superclass containing virtual table of fields for ancestor
  - method superConstruct(arg1, arg2, ...) - call base constructor with given arguments
  - method superConstructApply(args) - same as construct, bug arguments are given as array
  - method superConstructDirect(base, args) - call given base constructor with given array of arguments

- If both base and clazz are literal objects result is literal object too (modified clazz object)
with superclass field equal to base

options - optional object, can be omitted. Fields:

- extendFunc - Used for merging objects. Specified if simple Clazz.extend isn't enough

- autoConstruct - If specified, constructor of base class is called automatically on creation of object.

Assumption: if not autoConstruct then constructor of clazz should call constructor of 'base' explicitly

    Clazz.inheritConstruct(base, options, clazz) 

creates and returns class same as 'clazz' but inheriting from 'base'. constructor of base class is called
automatically on creation of object.

(Shortcut for .inherit method with autoConstruct option.)

    Clazz.extend(source, target)

simple copying of fields from source to target. Returns target

Use it if no need for own properties check or other complex stuff, otherwise use things like jQuery.extend


# Example 1. Definition of class


    var SomeClass = function(protected, parameterOfConstructor) {
        var privateVariable = parameterOfConstructor;
        this.fieldOfClass = 0;
        this.methodOfClass = function () { return this.fieldOfClass + privateVariable + protected.someProtectedVariable; }
    };
    
In order to have protected scope any descendant of SomeClass can create an object and pass it as constructor parameter 'protected'. So only SomeClass and its descendants will have access to protected.someProtectedVariable.

Class methods defined outside a constructor are also supported but they can't have access to private members and fields.

    Someclass.prototype.someOtherMethod = function(param) { this.fieldOfClass = param + 5; }

Also literal objects are supported by library. But they can't have private and protected fields and members. 

    var OtherClass = {
        fieldOfClass: 0,
        methodOfClass = function () { return this.fieldOfClass + 5; }
    }


# Example 2. Using library to inherit class


    var Parent = function(constructorParam) {
        var privateVar = 0;
        this.fieldOfParent = 0;
        Clazz.extend(this, {
            getPrivateVar: function() {return privateVar + (constructorParam || 0);},
            getFieldOfParent: function() {return this.fieldOfParent;},
            setPrivateVar: function(newPrivateVar){
                this.fieldOfParent = newPrivateVar + 10;
                privateVar=newPrivateVar;
            }
        });        
    };

    var Child = Clazz.inherit(Parent, function() {
        this.superConstructApply(arguments);
        
        var anotherPrivateVar = 1;
        Clazz.extend(this,{
            setPrivateVar: function(newPrivateVar){
                this.superclass.setPrivateVar.call(this,newPrivateVar+anotherPrivateVar);
            }
        })
    });

    var obj = new Child(100);
    obj.setPrivateVar(1);
    console.log(obj.getPrivateVar()); //prints 102
    console.log(obj.getFieldOfParent()); //prints 12

Explanation:

Clazz.inherit is used to inherit Child from Parent. Child redefines setPrivateVar to control value assigned to privateVar.

Child overrides Parent's method setPrivateVar and inside override calls method of Parent using this.superclass. So it has an access a value of private variable of Parent.

Child calls this.superConstructApply to call constructor of Parent. As it passes its own list of arguments, this call can be replaced with option.autoConstruct



    var Child = Clazz.inherit(Parent, {autoConstruct: true}, {
        var anotherPrivateVar = 1;
        Clazz.extend(this,{
            setPrivateVar: function(newPrivateVar){
                this.superclass.setPrivateVar.call(this,newPrivateVar+anotherPrivateVar);
            }
        })
    });
    

There is a shortcut for this option. The following code does the same.


    var Child = Clazz.inheritConstruct(Parent, {
        var anotherPrivateVar = 1;
        Clazz.extend(this,{
            setPrivateVar: function(newPrivateVar){
                this.superclass.setPrivateVar.call(this,newPrivateVar+anotherPrivateVar);
            }
        })
    });


If we remove Child's private field anotherPrivateVar, we can make use literal object.


    var Child = Clazz.inherit(Parent, {
        setPrivateVar: function(newPrivateVar){
                this.superclass.setPrivateVar.call(this,newPrivateVar+1);
            }
    });


Though inherit is used here and not inheritConstruct, parent's constructor is anyway called if we use literal objects.
