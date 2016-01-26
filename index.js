process.env.NODE_ENV='dev';
process.env.DEBUG='jnode:noble*,jnode:core';

global.Queue=function(processor, queue)
{
    if(this==global)
        return new Queue(processor, queue);
    var processing=false;
    var filePath=queue;
    if(typeof(queue)=='string')
        queue=JSON.parse($('fs').readFileSync(queue));
    else
        filePath=null;
    queue=this.pending=queue || [];
    console.log(queue);
    var self=this;
    this.enqueue=function(message){
        console.log(message);
        queue.push(message);
        self.save();
        processQueue();
    };
    
    this.save=function()
    {
        if(filePath)
            $('fs').writeFile(filePath, JSON.stringify(queue), function(err){
                if(err)
                    console.log(err);
            });
        
    }
    
    var processQueue=this.process=function(){
        if(processing)
            return;
        processing=true;
        var message=queue.shift();
        self.current=message;
        if(!message)
            return processing=false;
        processor(message, function(processed){ 
            if(processed===false)
            {
                self.enqueue(message);
            }
            self.save(); 
            processing=false; 
            if(processed!==false)
                process.nextTick(processQueue);
            
        });
    };

    if(queue.length>0)
        processQueue();
};

require('jnode');
