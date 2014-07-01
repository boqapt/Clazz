Clazz
=====

This lightweight OOP library provides some simple OOP features:
- inherit from prototype of parent class. Single inheritance s available, multiple not supported.
- preserve private fields and methods of parent classes and access to them with this inheritance
- use of fast prototype inheritance when it's possible
- use of functional inheritance when prototype inheritance is not enough (to preserve parent's private members).

Some other OOP libraries tend to implement all OOP features, like protected fields and interfaces. For that they use complex syntax, for example, a separate scope for variables with specific visibility or defining names of classes or fields inside strings. It complicates debugging and confuses IDE syntax highlighting.

But this library has a goal to include only features natural for JS, use syntax and keywords of JS intended for OOP at maximum and have small footprint (see [example 1](#example-1-definition-of-class))


API
---

    Clazz.inherit(base, options, clazz)

creates and returns class having functionality of 'clazz' but inheriting from 'base'.

base (input parameter), clazz (input/output parameter): classes, whether function or literal object.

Prototype of clazz is modified (for inheriting) but only if clazz is a function and options.implicitConstruct is
not specified.

- If one of base and clazz is function then returned class is function used for creation of
objects by 'new' operator.
Created objects have method .superclass. It should be called to instantiate ancestor class.
Assumption: caller doesn't modify properties of 'this' before .superclass call (needed for correct work of constructor)
.superclass has variable number of arguments, all passed to ancestor's constructor
After this call method .superclass turns into field .superclass of object type
containing ancestor's methods (all own and inherited methods of ancestor). It's syntax like in Java language.

- If both base and clazz are literal objects result is literal object too (modified clazz object)
with superclass field equal to base

options - optional object, can be omitted. Fields:

- extendFunc - Used for merging objects. Specified if simple Clazz.extend isn't enough

- implicitConstruct - If specified, constructor of base class is called implicitly on creation of object.

Assumption: if not implicitConstruct then constructor of clazz should call constructor of 'base' explicitly
(if both constructors exist)

    Clazz.inheritConstruct(base, options, clazz) 

creates and returns class same as 'clazz' but inheriting from 'base'. constructor of base class is called
automatically on creation of object.

(Shortcut for .inherit method with implicitConstruct option set)

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

Class methods defined outside a constructor using .prototype are also supported but they can't have access to private members and fields.

    SomeClass.prototype.someOtherMethod = function(param) { this.fieldOfClass = param + 5; }

Literal objects are also supported by library. But they can't have private fields and members.

    var OtherClass = {
        fieldOfClass: 0,
        methodOfClass = function () { return this.fieldOfClass + 5; }
    }

As for me, I use literal objects if features they provide are enough, otherwise I prefer objects defined entirely inside a constructor function because they provide greatest encapsulation and OOP features.

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
        this.superclass.apply(this, arguments);
        
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

Clazz.inherit is used to inherit Child from Parent.

Child overrides Parent's method setPrivateVar and inside this override calls method of Parent using this.superclass.setPrivateVar. So it has an access to a value set to private variable of Parent.

Child invokes constructor of Parent by calling this.superclass(...). As Child passes to constructor its own list of arguments, this call can be replaced with option.implicitConstruct


    var Child = Clazz.inherit(Parent, {implicitConstruct: true}, {
        var anotherPrivateVar = 1;
        Clazz.extend(this,{
            setPrivateVar: function(newPrivateVar){
                this.superclass.setPrivateVar(newPrivateVar+anotherPrivateVar);
            }
        })
    });
    

There is a shortcut for this option. First line of the code above can be replaced with:


    var Child = Clazz.inheritConstruct(Parent, { ...


If we remove Child's private field anotherPrivateVar, we can use literal object:


    var Child = Clazz.inherit(Parent, {
        setPrivateVar: function(newPrivateVar){
             this.superclass.setPrivateVar(newPrivateVar+1);
        }
    });


Though inherit is used here and not inheritConstruct, parent's constructor is anyway called implicitly if we use literal objects.
