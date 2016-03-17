window.route={
    $rules:[],
    on:function(pattern, rewrite, fn)
    {
        this.$rules.push({route:pattern, params:rewrite, fn:fn});
    },
    trap:function(handler){
        this.$rules.trap=handler;
    }    
}

var firstProcessed=false;

$require('assets/core/js/matcher.js', function(matcher)
{
    $require('assets/core/js/formatter.js', function(formatter)
    { 
        var unprocessedRules=window.route.$rules;
        
        window.route=
        {
            $rules:[],
            on:function(pattern, rewrite, fn)
            {
                if (!fn && !rewrite)                      return route.on(null, null, pattern);
                if (!fn && typeof rewrite === 'string')   return route.on(pattern, rewrite, route);
                if (!fn && typeof rewrite === 'function') return route.on(pattern, null, rewrite);
                if (!fn) return route;
        
                this.$rules.push({pattern:matcher(pattern), rewrite:formatter(rewrite), fn:fn});
            },
            trap:function(handler){
                this.$rules.trap=handler;
            }
        };

        $.each(unprocessedRules, function(index, item)
        {
            window.route.on(item.route, item.params, item.fn);
        });
        if(unprocessedRules.trap)
            window.route.trap(unprocessedRules.trap);

        var currentRule;

        process=function()
        {
            var url=location.hash.substr(1);
            if(!firstProcessed)
                firstProcessed=route.$rules>0;
            for(var i in route.$rules)
            {
                var rule=route.$rules[i];
                if($.isFunction(rule))
                    rule(url);
                else
                {
                    var params = rule.pattern(url);
                    if (!params) continue;
                    if (rule.rewrite)
                        url = rule.rewrite(params);
                    if(currentRule!==rule)
                        leaving();
                    rule.fn(url, params, currentRule===rule);
                    currentRule=rule;
                    return;
                }
            }
        };
        
        function leaving()
        {
            for(var i in route.$rules)
            {
                var rule=route.$rules[i];
                if(!$.isFunction(rule))
                {
                    var params = rule.pattern('leaving');
                    if (!params) continue;
                    if (rule.rewrite)
                        url = rule.rewrite(params);
                    rule.fn('leaving', params, currentRule===rule);
                    return;
                }
            }
        }


        window.onhashchange=function(){
            process();
        };

        process();
    });
});