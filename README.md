Clazz
=====

This library addresses the problem of Javascript not being able at the same time:
- inherit from prototype of base class
- give all methods of mentioned prototype access to private variables of base class (private variables are defined in natural JS way as local variables in a constructor)

== API ==

    Clazz.inherit(base, clazz, extendFunc)
    //(object is used if no need for private fields)
    //base, clazz: constructors of classes, whether function or object.
    //extendFunc - function for merging prototypes. optional. Used if simplest extend isn't enough
    //Assumption: if base and class are functions they return nothing (they use .extend function for defining fields)
    //Assumption: base constructor supports calling without parameters (prototype construction mode)

    Clazz.extend(source, target)
    //simple copying of fields from source to target. Returns source
    //Use it if no need for own properties check or other complex stuff, otherwise use things like jQuery.extend

== Example ==

    var Parent = function(constructorParam) {
        if (!arguments.length) {
            installFields.call(this);
            return; //prototype creation mode
        }
        var privateVar = constructorParam.nonExistentField;
        this.fieldOfParent = 0;
        function installFields() {
            Clazz.extend(this, {
                getPrivateVar: function() {return privateVar + (constructorParam || 0);},
                getFieldOfParent: function() {return this.fieldOfParent;},
                setPrivateVar: function(newPrivateVar){
                    this.fieldOfParent = newPrivateVar + 10;
                    privateVar=newPrivateVar;
                }
            });
        };
        installFields.call(this);
    };

    var Child = Clazz.inherit(Parent, function() {
        this.baseApply(arguments);
        Clazz.extend(this,{
            setPrivateVar: function(newPrivateVar){
                this.base.setPrivateVar.call(this,newPrivateVar+1);
            }
        })
    });

    var obj = new Child(100);
    obj.setPrivateVar(1);
    console.log(obj.getPrivateVar()); //prints 102
    console.log(obj.getFieldOfParent()); //prints 12

Explanation:
- Clazz.inherit is used to inherit Child from Parent. Child redefines setPrivateVar to control value assigned to privateVar.

- About need of installFields function in Parent. installFields is a trick used to extract prototype of class defined
 inside a constructor.

Clazz.inherit calls Parent's constructor with no parameters to get this prototype. It doesn't need private variables because
they don't belong to prototype. So we should skip their definition. For that we use the fact that variables become defined
after line with their definition was executed, but functions become defined as soon as 1st line of their scope is being
executed. Prototype definition was put in a function to be able to get prototype ahead of definition of variables. We were
able to just place prototype definition at the beginning of constructor and exit the constructor after it but common
agreement is to place fields at the top and members at the bottom of classes code.

So we should somehow check that Parent's constructor is in prototype mode, call installFields and exit. To check prototype
mode we use the fact that the constructor has a parameter and Clazz.inherit calls it with no parameters.
Also if we didn't skip private variables definition we would get TypeError at line where .nonExistentField is accessed.
As you see, we don't have nothing like installFields in Child. Its because Child has no private fields.

TODO:

If a class has private fields but has no parameters of constructor we can't use arguments.length to check prototype mode.
Its not a big problem (because in this case construction of private fields most probably should not cause an error) but should
have some workaround.