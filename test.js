var Clazz = require('./');
var test = require('tap').test;

test('inherit from function constructor', function (t) {

    var r = function () {
        Clazz.extend(this, {
            getP:function () {
                return p;
            },
            getZ:function () {
                return this.zz;
            },
            setP:function (i) {
                this.zz = i + 10;
                p = i
            }
        });
        var p = 0;
        this.zz = 0;
    };

    var n = Clazz.inherit(r, function () {
        this.superclass.apply(this, arguments);
        Clazz.extend(this, {})
    });
    var j = Clazz.inherit(r, function () {
        this.superclass.apply(this, arguments);
        Clazz.extend(this, {})
    });

    var u = Clazz.inherit(n, function () {
        this.superclass.apply(this, arguments);
        Clazz.extend(this, {
            setP:function (i) {
                this.superclass.setP(i + 1);
            }
        })
    });

    var a = new r();
    a.setP(1);
    var b = new r();
    b.setP(2);


    var z = new j();
    z.setP(3);
    var q = new j();
    q.setP(4);
    var m = new n();
    m.setP(5);
    var h = new n();
    h.setP(6);

    var o = new u();
    o.setP(7);
    t.equal(a.getP(),1);
    t.equal(b.getP(),2);
    t.equal(z.getP(),3);
    t.equal(q.getP(),4);
    t.equal(m.getP(),5);
    t.equal(h.getP(),6);
    t.equal(o.getP(),8);

    t.equal(a.getZ(),11);
    t.equal(b.getZ(),12);
    t.equal(z.getZ(),13);
    t.equal(q.getZ(),14);
    t.equal(m.getZ(),15);
    t.equal(h.getZ(),16);
    t.equal(o.getZ(),18);
    t.end();
});

test('inherit from literal object constructor', function (t) {

    var r = function () {
        Clazz.extend(this, {
            getP:function () {
                return p;
            },
            getZ:function () {
                return this.zz;
            },
            setP:function (i) {
                this.zz = i + 10;
                p = i
            }
        });
        var p = 0;
        this.zz = 0;
    };

    var n = Clazz.inherit(r, {});
    var j = Clazz.inherit(r, {});

    var u = Clazz.inherit(n, function () {
        this.superclass.apply(this, arguments);
        Clazz.extend(this, {
            setP:function (i) {
                this.superclass.setP(i + 1);
            }
        })
    });

    var a = new r();
    a.setP(1);
    var b = new r();
    b.setP(2);


    var z = new j();
    z.setP(3);
    var q = new j();
    q.setP(4);
    var m = new n();
    m.setP(5);
    var h = new n();
    h.setP(6);

    var o = new u();
    o.setP(7);
    t.equal(a.getP(),1);
    t.equal(b.getP(),2);
    t.equal(z.getP(),3);
    t.equal(q.getP(),4);
    t.equal(m.getP(),5);
    t.equal(h.getP(),6);
    t.equal(o.getP(),8);

    t.equal(a.getZ(),11);
    t.equal(b.getZ(),12);
    t.equal(z.getZ(),13);
    t.equal(q.getZ(),14);
    t.equal(m.getZ(),15);
    t.equal(h.getZ(),16);
    t.equal(o.getZ(),18);
    t.end();
});