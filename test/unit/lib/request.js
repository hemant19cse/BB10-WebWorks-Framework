describe("requestination ", function () {
    var request,
        libPath = "./../../../",
        Whitelist = require(libPath + 'lib/policy/whitelist').Whitelist,
        server = require(libPath + 'lib/server'),
        mockedWebview;

    beforeEach(function () {
        request = require(libPath + "lib/request");
        mockedWebview = {
            originalLocation : "http://www.origin.com",
            executeJavaScript : jasmine.createSpy()
        };
    });

    it("creates a callback for yous", function () {
        var requestObj = request.init();
        expect(requestObj.networkResourceRequestedHandler).toBeDefined();
    });


    it("can access the whitelist", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview);
        requestObj.networkResourceRequestedHandler(JSON.stringify({url: url}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalled();
    });

    it("checks whether the request is for an iframe when accessing the whitelist", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview);
        requestObj.networkResourceRequestedHandler(JSON.stringify({url: url, targetType: "TargetIsXMLHTTPRequest"}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalledWith(url, true);
    });

    it("can apply whitelist rules and allow valid urls", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(true);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalled();
        expect(JSON.parse(returnValue).setAction).toEqual("ACCEPT");
    });

    it("can apply whitelist rules and deny blocked urls", function () {
        spyOn(Whitelist.prototype, "isAccessAllowed").andReturn(false);
        var url = "http://www.google.com",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url}));
        expect(Whitelist.prototype.isAccessAllowed).toHaveBeenCalled();
        expect(JSON.parse(returnValue).setAction).toEqual("DENY");
        expect(mockedWebview.executeJavaScript.mostRecentCall.args[0]).toEqual("alert('Access to \"" + url + "\" not allowed')");
    });

    it("can call the server handler when certain urls are detected", function () {
        spyOn(server, "handle");
        var url = "http://localhost:8472/roomService/kungfuAction/customExt/crystalMethod?blargs=yes",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url})),
            expectedRequest = {
                params: {
                    service: "roomService",
                    action: "kungfuAction",
                    ext: "customExt",
                    method: "crystalMethod",
                    args: "blargs=yes"
                },
                body: undefined,
                origin: "http://www.origin.com"
            },
            expectedResponse = {
                send: jasmine.any(Function)
            };
        expect(JSON.parse(returnValue).setAction).toEqual("SUBSTITUTE");
        expect(server.handle).toHaveBeenCalledWith(expectedRequest, expectedResponse);
    });

    it("can call the server handler correctly with a multi-level method", function () {
        spyOn(server, "handle");
        var url = "http://localhost:8472/roomService/kungfuAction/customExt/crystal/Method?blargs=yes",
            requestObj = request.init(mockedWebview),
            returnValue = requestObj.networkResourceRequestedHandler(JSON.stringify({url: url})),
            expectedRequest = {
                params: {
                    service: "roomService",
                    action: "kungfuAction",
                    ext: "customExt",
                    method: "crystal/Method",
                    args: "blargs=yes"
                },
                body: undefined,
                origin: "http://www.origin.com"
            },
            expectedResponse = {
                send: jasmine.any(Function)
            };
        expect(JSON.parse(returnValue).setAction).toEqual("SUBSTITUTE");
        expect(server.handle).toHaveBeenCalledWith(expectedRequest, expectedResponse);
    });

    it("unknown protocol handler is valid", function () {
        var requestObj = request.init();
        expect(requestObj.unknownProtocolHandler).toBeDefined();
    });

    it("prevents default for unknownProtocol", function () {
        var requestObj = request.init(),
            returnValue,
            mockedInvocation = {
                invoke: jasmine.createSpy("invoke")
            };
        GLOBAL.window = {};
        GLOBAL.window.qnx = {
            webplatform: {
                getApplication: function () {
                    return {
                        invocation: mockedInvocation
                    };
                }
            }
        };
        returnValue = requestObj.unknownProtocolHandler(JSON.stringify({
            url : "tel:647-123-1234"
        }));
        expect(JSON.parse(returnValue).setPreventDefault).toEqual(true);
        expect(mockedInvocation.invoke).toHaveBeenCalledWith({
            action: 'bb.action.OPEN',
            uri: "tel:647-123-1234"
        }, jasmine.any(Function));
    });
});
