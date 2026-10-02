import sys,importlib
sys.path.insert(0,'.')
mod=importlib.import_module(sys.argv[1]);D=getattr(mod,sys.argv[2]);E=getattr(mod,sys.argv[3])
bad=[(k,i,len(r)) for k,v in D.items() for i,r in enumerate(v) if len(r)!=16]+[(k,'rows',len(v)) for k,v in D.items() if len(v)!=16]
odd=[(k,i,c) for k,v in D.items() for i,r in enumerate(v) for c in set(r) if c not in '.kwbdDrRSyYZoOgGluUBipPqvVenNmjJtsch']
print(len(D),'bad',bad,'odd',odd[:10],'missing',[e for e,n in E.items() if n not in D and n!='star'])
