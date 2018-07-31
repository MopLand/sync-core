
var fs = require( 'fs' ), stat = fs.stat;
var path = require('path');
var glob = require('glob');

var app = {

	//原始文件
	Source : null,

	//目标文件
	Target : null,

	//选项参数
	Option : {},
	
	//字符LOGO
	Logo : [
		'                                                            ',
		' __   __   __     |  ___   __  _|_       __|  __   __   __  ',
		'|__) |  \' (__) (__, (__/_ (___  |_,     (__| (__) |  \' (__( ',
		'|                                                           ',
		'',
	],
	
	//文件清单
	File : [
		'library/',
		'public/',
		'static/js/hybrid.js',
		'static/js/hybrid.css',
		'vendor/optimize.php'
	],
	
	//详细清单
	Data : [],

	//扫描文件
	Scan : function( fn ){
	
		var rule = new RegExp( app.File.join('|') );
		var data = [];
	
		glob('**', { cwd : app.Source, nocase : true }, function (er, files) {
			
			app.Data = files.filter(function( src ){
				return rule.test( src );			
			});
			
			console.log( '文件总计：' + app.Data.length );			
			console.log( '-----------------------------------' );			
			app.Read();
			
		});
	
	},

	//读取清单
	Read : function( ){

		if( app.Data.length == 0 ){
			
			console.log( '任务完成' );
			console.log( '-----------------------------------' );

			process.exit();

		}else{
			app.Copy();
		}

	},
	
	//创建目录
	Mkdir : function( dst ){
		
		var dir = dst.split('/');
		var add = '';
		
		dir.forEach( function( k, i ){
		
			add = dir.slice( 0, i ).join('/');
			
			if( add && !fs.existsSync( add ) ){
				fs.mkdirSync( add );
			};
			
		} );
	
	},
	
	//复制文件
	Copy : function( src, dst ){
	
		//从清单中删除
		var item = app.Data.shift();
	
		//构造文件地址
		var src = app.Source + '/' + item,
			dst = app.Target + '/' + item,
			readable, writable;
		
		//显示文件清单
		if( app.Option.l !== undefined ){
			console.log( src );
		}
		
		/////////////////////
		
		app.Mkdir( dst );
		
		/////////////////////
		
		stat( src, function( err, st ){
			if( err ){
				throw err;
			}

			// 判断是否为文件
			if( st.isFile() ){			
				// 创建读取流
				readable = fs.createReadStream( src );
				// 创建写入流
				writable = fs.createWriteStream( dst ); 
				// 通过管道来传输流
				readable.pipe( writable );
				// 拷贝完成
				writable.on('close', function () {
					app.Read();
				});
			}else{
				app.Read();
			}
			
		});
	
	},
	
	//分析参数
	Argv : function( ){
	
		var data = {};
		var argv = process.argv;
		
		argv.forEach(function( v, i ){
			if( v.indexOf('-') == 0 ){
				var k = v.replace(/-/g,'');
				if( argv[i + 1] ){
					data[k] = argv[i + 1];
				}else{
					data[k] = null;
				}
			}			
		});
		
		return data;
	
	},
		

	//初始化
	Init : function( dir ){
	
		var opts = app.Argv();
		var okay = true;
		
		if( opts.h !== undefined ){
			//console.log( '框架核心文件同步工具' );
			app.Logo.forEach(function( t ){
				console.log( t );
			});
			console.log( '-----------------------------------' );
			console.log( '-s 原始文件' );
			console.log( '-d 目标文件' );
			console.log( '-l 可选，显示文件清单' );
			return;
		}
	
		if( !opts.s ){
			okay = console.log( '请输入原始文件地址: -s' );
		}
	
		if( !opts.d ){
			okay = console.log( '请输入目标文件地址: -d' );
		}
	
		if( opts.s && opts.s == opts.d ){
			okay = console.log( '原始文件不能和目标文件相同' );
		}
		
		if( okay ){
			app.Option = opts;
			app.Source = opts.s;
			app.Target = opts.d;
			app.Scan( app.Stop );
		}
	}

}


app.Init();
 
