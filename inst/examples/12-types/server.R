library(shiny)
library(shinyTree)

#' Examples of using jstree types to define node attributes
#' @author Michael Bell \email{bellma@@lilly.com}
shinyServer(function(input, output, session) {
  log <- c(paste0(Sys.time(), ": Interact with the tree to see the logs here..."))
  
  treeData <- reactive({
    tree <- list(
      root1 = structure("", stselected=TRUE,sttype="root"),
      root2 = structure(list(
        SubListA = structure(list(
            leaf1 = structure("",sttype="file",stid="leaf1"), 
            leaf2 = structure("",sttype="file",stid="leaf2"),
            leaf3 = structure("",sttype="file")),
            sttype="root",stopened=TRUE
            ),
        SubListB = structure(list(
          leafA = structure("",sttype="file"),
          leafB = structure("",sttype="file")
          ),stopened=TRUE,sttype="root")
      ),
      sttype="root",stopened=TRUE
    )
  )
    attr(tree$root2$SubListB$leafB,"stid") <- "B leaf"
    #print("TREEdata")
    #print(tree$root2$SubListB$leafB)
    tree
  })
  
  observeEvent(input$updateTree,{
    tree <- treeData()
    #print("update")
    #print(tree$root2$SubListB$leafB)
    updateTree(session, treeId = "tree", data = tree)
  })
  
  output$tree <- renderEmptyTree
  observe({
    updateTree(session, treeId = "tree", data = treeData())
  })
    
    
  observe({
    req(input$tree)
    #print("input")
    #print(input$tree$root2$SubListB$leafB)
    #print(input$tree)
  })
})
